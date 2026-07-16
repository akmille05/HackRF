"""
hackrf_pytorch_classifier.py

Standalone GNU Radio flowgraph that reads live IQ samples directly from a
HackRF One and runs PyTorch model inference on the stream in real time.
Pairs with your existing HackRF FFT / demod / filter scripts -- this one
adds the ML classification stage.

Requires:
    - gnuradio (with gr-osmosdr installed, which provides the HackRF source)
    - PyTorch
    - A HackRF One connected via USB

Usage:
    python3 hackrf_pytorch_classifier.py \
        --model amc_model_scripted.pt \
        --labels BPSK QPSK 8PSK QAM16 QAM64 \
        --freq 915e6 \
        --samp-rate 2e6 \
        --gain 20 \
        --window 1024

Model contract:
    Model must be a TorchScript file (torch.jit.script or torch.jit.trace)
    whose forward() takes a float32 tensor of shape (1, 2, window_size)
    -- real and imaginary IQ channels stacked -- and returns a float32
    tensor of shape (1, num_classes) of raw logits.
"""

import argparse
import sys

import numpy as np
import pmt
import torch
from gnuradio import gr
from gnuradio import blocks

try:
    import osmosdr
except ImportError:
    print(
        "ERROR: gr-osmosdr not found. Install it so GNU Radio can talk to "
        "the HackRF (e.g. 'sudo apt install gr-osmosdr' on Ubuntu, or build "
        "from source). This is the same source block your other HackRF "
        "scripts almost certainly already use.",
        file=sys.stderr,
    )
    raise


class TorchIQClassifier(gr.sync_block):
    """
    Buffers `window_size` complex IQ samples from the HackRF, runs a
    PyTorch TorchScript model on each window, and publishes the predicted
    label + confidence as a PMT message on the 'classification' port.
    """

    def __init__(self, model_path, window_size, class_labels, device="cpu"):
        gr.sync_block.__init__(
            self,
            name="torch_iq_classifier",
            in_sig=[np.complex64],
            out_sig=None,
        )
        self.window_size = window_size
        self.class_labels = class_labels
        self.device = torch.device(device)

        self.model = torch.jit.load(model_path, map_location=self.device)
        self.model.to(self.device)
        self.model.eval()

        self._buffer = np.array([], dtype=np.complex64)
        self.message_port_register_out(pmt.intern("classification"))

    def work(self, input_items, output_items):
        in0 = input_items[0]
        self._buffer = np.concatenate([self._buffer, in0])

        while len(self._buffer) >= self.window_size:
            window = self._buffer[: self.window_size]
            self._buffer = self._buffer[self.window_size:]
            self._run_inference(window)

        return len(in0)

    def _run_inference(self, window):
        iq = np.stack([window.real, window.imag]).astype(np.float32)
        tensor = torch.from_numpy(iq).unsqueeze(0).to(self.device)

        with torch.inference_mode():
            output = self.model(tensor)
            probs = torch.softmax(output, dim=-1).squeeze(0).cpu().numpy()

        pred_idx = int(np.argmax(probs))
        label = (
            self.class_labels[pred_idx]
            if self.class_labels and pred_idx < len(self.class_labels)
            else str(pred_idx)
        )

        result = pmt.make_dict()
        result = pmt.dict_add(result, pmt.intern("label"), pmt.intern(label))
        result = pmt.dict_add(
            result, pmt.intern("confidence"), pmt.from_double(float(probs[pred_idx]))
        )
        self.message_port_pub(pmt.intern("classification"), result)


class PredictionPrinter(gr.basic_block):
    """Minimal message sink: prints each classification result to stdout."""

    def __init__(self):
        gr.basic_block.__init__(
            self, name="prediction_printer", in_sig=[], out_sig=[]
        )
        self.message_port_register_in(pmt.intern("classification"))
        self.set_msg_handler(pmt.intern("classification"), self._handle_msg)

    def _handle_msg(self, msg):
        label = pmt.symbol_to_string(pmt.dict_ref(msg, pmt.intern("label"), pmt.PMT_NIL))
        conf = pmt.to_double(pmt.dict_ref(msg, pmt.intern("confidence"), pmt.PMT_NIL))
        print(f"Predicted: {label:8s}  confidence: {conf:.3f}")


class HackRFTorchFlowgraph(gr.top_block):
    """
    HackRF -> PyTorch classifier -> stdout prediction printer.

    This mirrors the source setup you'd use in your FFT/demod/filter
    flowgraphs -- swap out `self.classifier` for a different Torch block
    (e.g. a TorchStreamFilter) if you want denoising instead of
    classification.
    """

    def __init__(self, model_path, class_labels, freq, samp_rate, gain,
                 if_gain, bb_gain, window_size, device):
        gr.top_block.__init__(self, "HackRF PyTorch Classifier")

        # --- HackRF source (gr-osmosdr) ---
        self.src = osmosdr.source(args="hackrf=0")
        self.src.set_sample_rate(samp_rate)
        self.src.set_center_freq(freq)
        self.src.set_freq_corr(0)
        self.src.set_gain(gain)
        self.src.set_if_gain(if_gain)
        self.src.set_bb_gain(bb_gain)
        self.src.set_antenna("")
        self.src.set_bandwidth(0)

        # --- PyTorch inference block ---
        self.classifier = TorchIQClassifier(
            model_path=model_path,
            window_size=window_size,
            class_labels=class_labels,
            device=device,
        )

        # --- Result sink ---
        self.printer = PredictionPrinter()

        # --- Wiring ---
        self.connect(self.src, self.classifier)
        self.msg_connect(
            (self.classifier, "classification"), (self.printer, "classification")
        )


def parse_args():
    p = argparse.ArgumentParser(description="HackRF + PyTorch real-time classifier")
    p.add_argument("--model", required=True, help="Path to TorchScript (.pt) model file")
    p.add_argument("--labels", nargs="+", default=None,
                   help="Class labels in model output order, e.g. BPSK QPSK 8PSK")
    p.add_argument("--freq", type=float, default=915e6, help="Center frequency in Hz")
    p.add_argument("--samp-rate", type=float, default=2e6, help="Sample rate in Hz")
    p.add_argument("--gain", type=float, default=20, help="HackRF RF (VGA) gain")
    p.add_argument("--if-gain", type=float, default=20, help="HackRF IF gain")
    p.add_argument("--bb-gain", type=float, default=20, help="HackRF baseband gain")
    p.add_argument("--window", type=int, default=1024, help="IQ samples per inference window")
    p.add_argument("--device", default="cpu", choices=["cpu", "cuda"],
                   help="Torch device to run inference on")
    return p.parse_args()


def main():
    args = parse_args()

    fg = HackRFTorchFlowgraph(
        model_path=args.model,
        class_labels=args.labels,
        freq=args.freq,
        samp_rate=args.samp_rate,
        gain=args.gain,
        if_gain=args.if_gain,
        bb_gain=args.bb_gain,
        window_size=args.window,
        device=args.device,
    )

    print(f"Tuning HackRF to {args.freq/1e6:.3f} MHz, sample rate {args.samp_rate/1e6:.3f} Msps")
    print("Starting flowgraph... press Ctrl+C to stop.")

    fg.start()
    try:
        fg.wait()
    except KeyboardInterrupt:
        print("\nStopping...")
        fg.stop()
        fg.wait()


if __name__ == "__main__":
    main()