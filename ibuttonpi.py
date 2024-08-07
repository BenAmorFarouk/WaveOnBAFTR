import os
import time
import RPi.GPIO as GPIO
from threading import Thread


os.system('modprobe wire timeout=1 slave_ttl=3')
os.system('modprobe w1-gpio')
os.system('modprobe w1-smem')
#os.system('chmod a+w /sys/devices/w1_bus_master1/w1_master_slaves')
#os.system('chmod a+w /sys/devices/w1_bus_master1/w1_master_remove')
#os.system('chmod a+w /sys/devices/w1_bus_master1/w1_master_search')
base_dir = '/sys/devices/w1_bus_master1/w1_master_slaves'
delete_dir = '/sys/devices/w1_bus_master1/w1_master_remove'

class id_thread(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.device_id = None

    def run(self):
        exist = False
        times = 0
        while not exist and times < 5:
            with open(base_dir, "r") as f:
                self.device_id = f.read().strip()
                self.device_id= self.device_id.split("\n")[-1]
                print(self.device_id)
            time.sleep(1)
            if not self.device_id.startswith("not"):
                exist = True
            times += 1

thread_a = id_thread()
thread_a.start()
thread_a.join()

device_id_value = thread_a.device_id
print("Device ID:", device_id_value)
