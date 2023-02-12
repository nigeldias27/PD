import { useState } from "react";
import axios from "axios";
export default function SpiralComponent() {
  const [data, setData] = useState({});
  const [result, setResult] = useState("");
  const [csvData, setcsvData] = useState({});
  const [base, setBase] = useState("");
  const changed = (props) => (e) => {
    var d = {};
    d[props] = e.target.value;
    setData({ ...data, ...d });
    console.log(data);
  };
  const fileUpload = async () => {
    console.log("Running");
    let input = document.createElement("input");
    input.type = "file";

    input.onchange = async (_) => {
      let files = Array.from(input.files);
      const file = files[0];
      var formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(
        "http://127.0.0.1:5000/spiral",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data["res"]);
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
      <div className="pt-4 grid grid-cols-3"></div>

      <div className="flex justify-center flex-col items-center m-24">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Archimedean_spiral.svg/1200px-Archimedean_spiral.svg.png"
          width={200}
          height={200}
        ></img>
        <h1 className="text-lg mt-12">Please imitate this diagram</h1>
        <button
          class="w-54 drop-shadow-xl mt-12 font-small rounded-md bg-gradient-to-r from-purple-400 to-purple-500 py-3 px-8 text-white"
          type="file"
          onClick={async () => {
            fileUpload();
          }}
        >
          <div className="flex flex-row justify-center items-center">
            <span className="text-xl">Upload Image</span>
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
