from python_hackrf import pyhackrf
pyhackrf.pyhackrf_init()
sdr = pyhackrf.pyhackrf_open() 
# config variables go here
#sdr

# find out what the config variables are


def devInfo():

    board_id = pyhackrf.pyhackrf_board_id_read(sdr)
    version = pyhackrf.pyhackrf_version_string_read(sdr)
    serial = pyhackrf.pyhackrf_board_partid_serialno_read(sdr)
    print(f"Board ID: {board_id}, Version: {version}, Serial: {serial}")
    
def send_command(command):
    if command  == "version":
        return pyhackrf.pyhackrf_version_string_read(sdr)
    elif command == "serial":
        return pyhackrf.pyhackrf_board_partid_serialno_read(sdr)
    elif command == "board_id":
        return pyhackrf.pyhackrf_board_id_read(sdr)
    else: 
        return "Unknown command"

def query_result():
    

# Write getters and setters for the config variables