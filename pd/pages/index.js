import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import VGFRComponent from "@/components/vgfr";
import SpeechComponent from "@/components/speech";
import bg from "../assests/background.jpeg";
import SpiralComponent from "@/components/spiral";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [data, setData] = useState({});
  const [result, setResult] = useState("");
  const [csvData, setcsvData] = useState({});
  const [base, setBase] = useState("");
  const [role, setRole] = useState("VGFR");
  const [incrementor, setIncrementor] = useState(1);
  const [resList, setResList] = useState([]);
  const selected =
    "p-20 bg-gradient-to-r from-purple-400 to-purple-500 text-white font-small text-lg rounded-lg";
  const notSelected =
    "p-20 border-solid border-2 border-purple-500 text-black font-small text-lg rounded-lg";
  const roleClicked = (option) => {
    setRole(option);
  };
  useEffect(() => {
    console.log(resList);
    setData({});
    setResult("");
    setcsvData({});
    setBase("");
  }, [role]);
  if (role == "VGFR") {
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
    const fileUpload = () => {
      console.log("Running");
      let input = document.createElement("input");
      input.type = "file";

      input.onchange = (_) => {
        let files = Array.from(input.files);
        const file = files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          console.log(reader.result);
        };
        reader.onerror = function (error) {
          console.log("Error: ", error);
        };
      };
      input.click();
    };

    return (
      <div className="w-screen bg-purple-100  flex items-center justify-center">
        <div
          className="rounded-xl bg-white w-5/6 my-24 drop-shadow-2xl"
          style={{
            backgroundImage: `url(${bg.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <h1
            className=" text-7xl text-center m-24"
            style={{ fontFamily: "'Annie Use Your Telescope', cursive" }}
          >
            Parkinson's Disease Test
          </h1>
          <div className="flex flex-row justify-around">
            <div className={role == "VGFR" ? selected : notSelected}>
              VGFR Test
            </div>
            <div className={role == "Speech" ? selected : notSelected}>
              Speech Test
            </div>
            <div className={role == "Spiral" ? selected : notSelected}>
              Spiral Test
            </div>
          </div>
          <div>
            <div className="pt-4 grid grid-cols-3">
              <div className="px-4">
                <input
                  placeholder="Name"
                  onChange={changed("Name")}
                  className="w-full my-4 px-4 py-2 text-base border border-gray-300 rounded outline-none focus:ring-purple-500 focus:border-purple-500 focus:ring-1"
                ></input>
              </div>
              <div className="px-4">
                <input
                  placeholder="Age"
                  onChange={changed("Age")}
                  className="w-full my-4 px-4 py-2 text-base border border-gray-300 rounded outline-none focus:ring-purple-500 focus:border-purple-500 focus:ring-1"
                ></input>
              </div>
              <div className="px-4">
                <input
                  placeholder="Height"
                  onChange={changed("Height")}
                  className="w-full my-4 px-4 py-2 text-base border border-gray-300 rounded outline-none focus:ring-purple-500 focus:border-purple-500 focus:ring-1"
                ></input>
              </div>
            </div>
            <div className="pt-4 grid grid-cols-3">
              <div className="px-4">
                <input
                  placeholder="Weight"
                  onChange={changed("Weight")}
                  className="w-full my-4 px-4 py-2 text-base border border-gray-300 rounded outline-none focus:ring-purple-500 focus:border-purple-500 focus:ring-1"
                ></input>
              </div>
              <div className="px-4 flex">
                <input
                  placeholder="Phone no"
                  onChange={changed("Phone no")}
                  className="w-full my-4 px-4 py-2 text-base border border-gray-300 rounded outline-none focus:ring-purple-500 focus:border-purple-500 focus:ring-1"
                ></input>
              </div>
              <div className="px-4 flex">
                <input
                  class="w-full drop-shadow-xl font-small rounded-md bg-gradient-to-r from-purple-400 to-purple-500 py-3 px-8 text-white"
                  type="file"
                  onChange={changeHandler}
                />
              </div>
            </div>

            <div className="flex justify-center m-24">
              <button
                class="x-6 drop-shadow-xl font-small rounded-md bg-gradient-to-r from-purple-400 to-purple-500 py-3 px-8 text-white"
                type="submit"
                onClick={async () => {
                  console.log(csvData);
                  const response = await axios.post(
                    "http://127.0.0.1:5000",
                    csvData
                  );
                  setResult(response.data["res"]);
                  setRole("Speech");
                  setResList([...resList, response.data["res"]]);
                }}
              >
                <div className="flex flex-row items-center">
                  <span className="text-xl">Next</span>
                </div>
              </button>
            </div>
            {result == "" ? (
              <div></div>
            ) : result == "0" ? (
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
        </div>
      </div>
    );
  }
  if (role == "Speech") {
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
        setRole("Spiral");
        setResList([...resList, response.data["res"]]);
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
      <div className="w-screen bg-purple-100  flex items-center justify-center">
        <div
          className="rounded-xl bg-white w-5/6 my-24 drop-shadow-2xl"
          style={{
            backgroundImage: `url(${bg.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <h1 className="font-headers text-7xl text-center m-24">
            Parkinson's Disease Test
          </h1>
          <div className="flex flex-row justify-around">
            <div className={role == "VGFR" ? selected : notSelected}>
              VGFR Test
            </div>
            <div className={role == "Speech" ? selected : notSelected}>
              Speech Test
            </div>
            <div className={role == "Spiral" ? selected : notSelected}>
              Spiral Test
            </div>
          </div>
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
        </div>
      </div>
    );
  }
  if (role == "Spiral") {
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
        setRole("Res");
        setResList([...resList, response.data["res"]]);
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
      <div className="w-screen bg-purple-100  flex items-center justify-center">
        <div
          className="rounded-xl bg-white w-5/6 my-24 drop-shadow-2xl"
          style={{
            backgroundImage: `url(${bg.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <h1 className="font-headers text-7xl text-center m-24">
            Parkinson's Disease Test
          </h1>
          <div className="flex flex-row justify-around">
            <div className={role == "VGFR" ? selected : notSelected}>
              VGFR Test
            </div>
            <div className={role == "Speech" ? selected : notSelected}>
              Speech Test
            </div>
            <div className={role == "Spiral" ? selected : notSelected}>
              Spiral Test
            </div>
          </div>
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
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-screen h-screen bg-purple-100  flex items-center justify-center">
        <div
          className="rounded-xl bg-white w-5/6 my-24 drop-shadow-2xl"
          style={{
            backgroundImage: `url(${bg.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <h1 className="font-headers text-7xl text-center m-24">
            Parkinson's Disease Test
          </h1>
          <h1 className="text-2xl font-bold text-center mt-24 mb-12">
            Your score is:{" "}
            {2 * (resList[0] == "0" ? 0 : 1) +
              3 * (resList[1] == "1" ? 0 : 1) +
              5 * (resList[2] == "1" ? 0 : 1)}
          </h1>
          <h1 className=" font-thin text-xl text-center mb-6">
            {(resList[0] == "0" ? 0 : 1) +
              (resList[1] == "1" ? 0 : 1) +
              (resList[2] == "1" ? 0 : 1) ==
            0
              ? "Your results indicate that you likely don't have Parkinson's disease"
              : "Your results are indicative of Parkinson. Please consult a doctor at the earliest."}
          </h1>
          <div className="flex justify-center w-full  mb-24">
            <button
              class="w-54 drop-shadow-xl mt-12 font-small rounded-md bg-gradient-to-r from-purple-400 to-purple-500 py-3 px-8 text-white"
              type="file"
              onClick={async () => {
                setData({});
                setResult("");
                setcsvData({});
                setBase("");
                setRole("VGFR");
                setResList([]);
              }}
            >
              <div className="flex flex-row justify-center items-center">
                <span className="text-xl">Try Again</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
