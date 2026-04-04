import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import cv2
import queue
import time
import threading
import numpy as np
from pathlib import Path
from termcolor import colored

import Alert
from data_pip_shoplifting import Shoplifting_Live
import warnings
# warnings.filterwarnings("ignore")
# warnings.simplefilter(action='error', category=FutureWarning)
# warnings.simplefilter(action='ignore', category=FutureWarning)

# Just disables the warning, doesn't take advantage of AVX/FMA to run faster
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
from tensorflow.keras.models import load_model, model_from_json, Model
from tensorflow.keras import Input
from tensorflow.keras.optimizers import Adam, SGD
from tensorflow.keras.layers import Dense, Flatten, Conv3D, MaxPooling3D, Dropout, Multiply, Add, Concatenate, Lambda
from datetime import date, datetime


# from object_detection.utils import label_map_util
# from object_detection.utils import config_util
# from object_detection.utils import visualization_utils as viz_utils
# from object_detection.builders import model_builder

def get_abuse_model_and_weight_json():
    # read model json
    # load json and create model
    weight_abuse = r"./weights_at_epoch_3_28_7_21_round2.h5"
    json_path = r"./model_Abuse_at_epoch_3_28_7_21_round2.json"
    json_file = open(json_path, 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    abuse_model = model_from_json(loaded_model_json)
    # load weights into new model
    abuse_model.load_weights(weight_abuse)
    print("Loaded EMS model,weight_steals from disk")
    return abuse_model

# ABUSE_MODEL = get_abuse_model_and_weight_json()
q = queue.Queue(maxsize=3000)
frame_set = []
END_OF_STREAM = object()


Frame_set_to_check = []
Frame_INDEX = 0
lock = threading.Lock()
Email_alert_flag = False
email_alert = Alert.Email_Alert()
shoplifting_SYS = Shoplifting_Live()
W=0
H=0
src_main_dir_path = str(Path(__file__).resolve().parent / "DB_Sample" / "output")
#src_main_dir_path = r"C:\Users\amit hayoun\Desktop\test3\3\aaa.avi"



def Receive():
    global H,W
    #print("start Receive")
    #rtsp://SIMCAM:2K93AG@192.168.1.2/live
    #video_cap_ip = 'rtsp://SIMCAM:S6BG9J@192.168.1.20/live'
    #video_cap_ip = r'rtsp://barloupo@gmail.com:ziggy2525!@192.168.1.9:554/stream2'
    video_cap_ip = Path(__file__).resolve().parent / "DB_Sample" / "input" / "test.mp4"
    cap = cv2.VideoCapture(str(video_cap_ip))

    if not cap.isOpened():
        print(colored(f"[-] Failed to open input stream: {video_cap_ip}", 'red'))
        q.put(END_OF_STREAM)
        return
    # cap.set(3, 640)
    # cap.set(4, 480)
    W = int(cap.get(3))
    H = int(cap.get(4))
    #print("H={}\nW={}".format(H,W))
    ret, frame = cap.read()
    if not ret or frame is None:
        print(colored(f"[-] No frames read from input stream: {video_cap_ip}", 'red'))
        q.put(END_OF_STREAM)
        cap.release()
        return

    print(colored(ret, 'green'))
    q.put(frame)
    #while cap.isOpened():
    while ret:
        ret, frame = cap.read()
        if not ret or frame is None:
            break
        q.put(frame)

    cap.release()
    q.put(END_OF_STREAM)


def Display():
    global Frame_set_to_check,Frame_INDEX
    print(colored('Start Displaying', 'blue'))

    while True:
        if q.empty() != True :
            frame = q.get()
            if frame is END_OF_STREAM:
                if len(frame_set) > 10:  # process remaining frames at the end
                    Frame_set_to_check = frame_set.copy()
                    Pred()
                break

            frame_set.append(frame.copy())
            #print(len(frame_set))
            if len(frame_set) >= 149:
                Frame_set_to_check = frame_set.copy()

                #print(type(Frame_set_to_check))
                #p3 = threading.Thread(target=Pred)
                Pred()
                time.sleep(1)
                frame_set.clear()

            cv2.imshow("frame1", frame)
        if cv2.waitKey(50) & 0xFF == ord('q'):
            break

def Pred():
    global Frame_set_to_check, Frame_INDEX
    #ems = EMS_Live()
    with lock:
        #RGB + OPT NET
        #shoplifting_SYS.build_shoplifting_net_models()

        #RGB NET ONLY
        if shoplifting_SYS.shoplifting_model is None:
            shoplifting_SYS.shoplifting_model = shoplifting_SYS.ShopliftingNet_RGB.load_model_and_weight()

        Frame_set_to_check_np = np.array(Frame_set_to_check.copy())

        Frame_set = shoplifting_SYS.make_frame_set_format(Frame_set_to_check_np)

        reports = shoplifting_SYS.run_Shoplifting_frames_check_live_demo_2_version(Frame_set, Frame_INDEX)
        #print(reports)
        Frame_INDEX = Frame_INDEX + 1
        ##
        Bag = reports[0]
        Clotes = reports[1]
        Normal = reports[2]
        state = reports[3]
        #todo event_index maybe paas a dict
        event_index = reports[4]
        #print("event_index {}".format(event_index))
        ##


        if (state):
            print(colored(f"---------------------", 'red'))
            print(colored('*** THEFT DETECTED ***', 'red'))
            detected_type = "Bag-oriented Theft" if Bag > Clotes else "Clothing-oriented Theft"
            print(colored(f"Type: {detected_type}", 'red'))
            print(colored(f"Probabilities | Bag: {Bag} | Clothes: {Clotes} | Normal: {Normal}", 'red'))
            print(colored(f"Test number:{Frame_INDEX-1}\n---------------------\n", 'red'))

            prob = [Bag, Clotes,Normal]

            found_fall_video_path = shoplifting_SYS.save_frame_set_after_pred_live_demo(src_main_dir_path,
                                                                                 Frame_set_to_check,
                                                                                 Frame_INDEX-1, prob,
                                                                                 0, W, H)

            if Email_alert_flag:
                file_name = found_fall_video_path.split("\\")[-1]
                print(f"path = to email{found_fall_video_path}")
                print(f"file name: {file_name}")
                absulutefilepath = found_fall_video_path
                email_alert.send_email_alert(email_alert.user_email_address3, file_name,
                                                  absulutefilepath)

        else:
            print(colored(f"---------------------", 'green'))
            print(colored("*** NORMAL ***", 'green'))
            print(colored(f"Probabilities | Bag: {Bag} | Clothes: {Clotes} | Normal: {Normal}", 'green'))
            print(colored(f"Test number:{Frame_INDEX - 1}\n---------------------\n", 'green'))
            Frame_set_to_check.clear()

        #lock.release()
        time.sleep(1)



if __name__ == '__main__':
    p1 = threading.Thread(target=Receive)
    p2 = threading.Thread(target=Display)
    #p3 = threading.Thread(target=Pred)
    p1.start()
    p2.start()
    #p3.start()