import { useState } from "react";
import Papa from "papaparse";
import axios from "axios";
export default function SpeechComponent() {
  const [data, setData] = useState({});
  const [result, setResult] = useState("");
  const [csvData, setcsvData] = useState({});
  const [base, setBase] = useState("");
  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];

        // Iterating data to get column name and their values
        results.data.map((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });
        console.log(results.data);
        setcsvData({ ...results.data[0] });
        // Parsed Data Response in array format
        // setParsedData(results.data);

        // Filtered Column Names
        //  setTableRows(rowsArray[0]);

        // Filtered Values
        //  setValues(valuesArray);
      },
    });
  };
  const changed = (props) => (e) => {
    var d = {};
    d[props] = e.target.value;
    setData({ ...data, ...d });
    console.log(data);
  };
  const fileUpload = async () => {
    let input = document.createElement("input");
    input.type = "file";

    input.onchange = async (_) => {
      let files = Array.from(input.files);
      const file = files[0];
      var formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(
        "http://127.0.0.1:5000/speech",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(response.data["res"]);
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        console.log(reader.result);
        setBase(reader.result);
      };
      reader.onerror = function (error) {
        console.log("Error: ", error);
      };
    };
    input.click();
  };

  return (
    <div>
      <div className="pt-4 grid grid-cols-3">
        <div className="px-4 flex"></div>
      </div>

      <div className="flex justify-center m-24">
        <button
          class="x-6 drop-shadow-xl font-small rounded-md bg-gradient-to-r from-purple-400 to-purple-500 py-3 px-8 text-white"
          type="submit"
          onClick={async () => {
            fileUpload();
          }}
        >
          <div className="flex flex-row items-center">
            <span className="text-xl">Upload Audio</span>
          </div>
        </button>
      </div>
      {result == "" ? (
        <div></div>
      ) : result == "1" ? (
        <div className="w-full flex justify-center">
          <h1 className="font-head text-xl text-center mb-24">
            You don't have Parkinson's Disease
          </h1>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <h1 className="font-head text-xl text-center mb-24">
            You have Parkinson's Disease
          </h1>
        </div>
      )}
    </div>
  );
}
