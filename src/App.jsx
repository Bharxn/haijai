import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [blowDetected, setBlowDetected] = useState(false);
  let audioContext;
  let analyser;
  let microphone;
  const [showAverage, setShowAverage] = useState();

  useEffect(() => {
    const initializeMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);

        microphone.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const detectBlow = () => {
          analyser.getByteFrequencyData(dataArray);

          const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
          setShowAverage(average);
          console.log(average);
          if (average > 75) {
            setBlowDetected(true);
          }else {
            setBlowDetected(false);
          }

          requestAnimationFrame(detectBlow);
        };

        detectBlow();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    initializeMicrophone();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [blowDetected]);
  
  const audioRef = useRef(null);

  const [time, setTime] = useState(0); // Initialize time state

  useEffect(() => {
    // Set the interval to increment the time every second
    const timerId = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    // Cleanup function to clear the timer when the component unmounts or resets
    return () => {
      clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if(time >= 10) {
      let audio = new Audio('beep.mp3');
      audio.play();
    }
  }, [time]);

  useEffect(() => {
    if(blowDetected) {
      setTime(0);
    }
  }, [blowDetected]);

  return (
    <>
      {time < 10 ? <h1>status : OK</h1> : <h1>status : Danger</h1>}
      <h1> time : {time} second</h1>
    </>
  )
}

export default App
