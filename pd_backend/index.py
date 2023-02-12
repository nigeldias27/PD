import json
from flask import Flask, request, jsonify
import pickle
import cv2
import base64
import numpy as np
from flask_cors import CORS, cross_origin
from tensorflow import keras
import parselmouth
from parselmouth.praat import call
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import pandas as pd
from sklearn.preprocessing import PolynomialFeatures
from sklearn import decomposition
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

app = Flask(__name__)
CORS(app, support_credentials=True)

def measurePitch(voiceID, f0min, f0max, unit):
    sound = parselmouth.Sound(voiceID) # read the sound
    pitch = call(sound, "To Pitch", 0.0, f0min, f0max) #create a praat pitch object
    meanF0 = call(pitch, "Get mean", 0, 0, unit) # get mean pitch
    stdevF0 = call(pitch, "Get standard deviation", 0 ,0, unit) # get standard deviation
    harmonicity = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
    hnr = call(harmonicity, "Get mean", 0, 0)
    pointProcess = call(sound, "To PointProcess (periodic, cc)", f0min, f0max)
    localJitter = call(pointProcess, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
    localabsoluteJitter = call(pointProcess, "Get jitter (local, absolute)", 0, 0, 0.0001, 0.02, 1.3)
    rapJitter = call(pointProcess, "Get jitter (rap)", 0, 0, 0.0001, 0.02, 1.3)
    ppq5Jitter = call(pointProcess, "Get jitter (ppq5)", 0, 0, 0.0001, 0.02, 1.3)
    ddpJitter = call(pointProcess, "Get jitter (ddp)", 0, 0, 0.0001, 0.02, 1.3)
    localShimmer =  call([sound, pointProcess], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
    localdbShimmer = call([sound, pointProcess], "Get shimmer (local_dB)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
    apq3Shimmer = call([sound, pointProcess], "Get shimmer (apq3)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
    aqpq5Shimmer = call([sound, pointProcess], "Get shimmer (apq5)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
    apq11Shimmer =  call([sound, pointProcess], "Get shimmer (apq11)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
    ddaShimmer = call([sound, pointProcess], "Get shimmer (dda)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
    return meanF0, localJitter, localabsoluteJitter, rapJitter, ppq5Jitter, ddpJitter, localShimmer, localdbShimmer, apq3Shimmer, aqpq5Shimmer, apq11Shimmer, ddaShimmer,hnr

@app.route('/', methods=['POST'])
@cross_origin(supports_credentials=True)
def update_record():
    scaler = StandardScaler()
    record = json.loads(request.data)
    loaded_model = pickle.load(open('knnpickle_file', 'rb'))
    print(record.values())
    input_data_as_np_array = np.asarray([float(i) for i in list(record.values())[1:]])
    df_co = pd.read_csv('Transformed_Co', index_col = 0)
    df_pt = pd.read_csv('Transformed_Pt' , index_col = 0)
    df_co_len = df_co.shape[0]
    df_pt_len = df_pt.shape[0]
    df_co_pca = pd.DataFrame(df_co)
    df_pt_pca = pd.DataFrame(df_pt)
    y1 = pd.Series([0]*df_co_len)
    y2 = pd.Series([1]*df_pt_len, index = range(df_co_len-1,(df_co_len + df_pt_len)-1))
    y = pd.concat([y1,y2]) 
    X = pd.concat([df_co_pca, df_pt_pca])

    X_train, X_test, y_train1, y_test1 = train_test_split(X, y)

    scaler = MinMaxScaler().fit(X_train)
    X_test = scaler.transform(X_test)


    input_reshaped = input_data_as_np_array.reshape(1,-1)

# standardize the input data 
    standard_data = scaler.transform(input_reshaped)
    print(len(standard_data[0]))
    #print(type(X_test))
    y_pred= loaded_model.predict(standard_data)
    print(y_pred)
    res = y_pred[0]
    return jsonify({"res":str(res)})
    

@app.route('/speech', methods=['POST'])
@cross_origin(supports_credentials=True)
def speech_record():
    scaler = StandardScaler()
    '''
    record = json.loads(request.data)["res"]

    wav_file = open("temp.wav", "wb")
    print(request.data)
    print(record)
    print(len(record + "=" * ((len(record) - len(record) % 4))))
    decode_string = base64.b64decode(record[0:len(record)-3])
    
    if (len(record)%4!=1):
        decode_string = base64.b64decode(record)
    else:
        decode_string = base64.b64decode(record[0:len(record)]-1)
        '''
    image_file = request.files.get('image', '')
    print(type(image_file))
    image_file.save("test.wav")
    loaded_model = pickle.load(open('svmpickle_file-2', 'rb'))
    input_data_as_np_array = np.asarray(list(measurePitch("test.wav", 65, 200, 'Hertz')))
    print(input_data_as_np_array)
    print(input_data_as_np_array.shape)
    parkinsons_data = pd.read_csv('Voice.csv')
    X = parkinsons_data.drop(columns=['name', 'status','MDVP:Fhi(Hz)','MDVP:Flo(Hz)','NHR','RPDE', 'DFA', 'spread1', 'spread2', 'D2', 'PPE'], axis=1)
    Y = parkinsons_data['status']
    print(X.shape)
    X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=2)
    print(X_train.shape)
    scaler.fit(X_train)


    input_reshaped = input_data_as_np_array.reshape(1,-1)

# standardize the input data 
    standard_data = scaler.transform(input_reshaped)
    print(len(standard_data[0]))
    #print(type(X_test))
    y_pred= loaded_model.predict(standard_data)
    print(y_pred)
    res = y_pred[0]
    return jsonify({"res":str(res)})

@app.route('/spiral', methods=['POST'])
@cross_origin(supports_credentials=True)
def spiral_record():
    #record = json.loads(request.data)["res"]
    #decode_string = base64.b64decode(record)
    image_file = request.files.get('image', '')
    print(type(image_file))
    image_file.save("imageToSave.jpeg")
    model = keras.models.load_model('my_h5_model.h5')
    img = cv2.imread('imageToSave.jpeg')
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = cv2.resize(img, (128, 128))
    img = np.array(img)
    img = np.expand_dims(img, axis=0)
    img = np.expand_dims(img, axis=-1)
    x = model.predict(img)
    print(x[0][0])
    return jsonify({"res":str(int(x[0][0]))})

app.run(debug=True)