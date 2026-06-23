from python_hackrf import pyhackrf
pyhackrf.pyhackrf_init()
sdr = pyhackrf.pyhackrf_open() #open connection to hackRF


#TOdo: print out device model, serial number, and firmware version

model_ID, model_name = sdr.pyhackrf_board_id_read() #number and name representing the HackRF model

serial_num = sdr.pyhackrf_serialno_read() #the unique hardware serial number

firmware_ver = sdr.pyhackrf_version_string_read() #firmware version 


print(f"Device Model ID: {model_ID}")
print(f"Device Model Name: {model_name}")
print(f"Serial Number: {serial_num}")
print(f"Firmware Version: {firmware_ver}")

sdr.pyhackrf_close() #close connection to hackRF
pyhackrf.pyhackrf_exit() # deinitialize the pyhackrf library