import React, { useState, useRef } from 'react';
import Scanner from './Scanner';
import Result from './Result';






const ScanWizard = (props) => {
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState([]);
    const scannerRef = useRef(null);
    const upc        = useRef(null);



    const update = (result) => {
       props.setAccount(result);
       setScanning(false);
       props.firstLookup(result);
    };

    const updateScan = (result) => {
       var res = result.toString();
       props.setAccount(res);
       setScanning(false);
       props.firstLookup();
    };


    return (
        <div style={{background:"black", textAlign:"center"}}>

            <input
              type="text"
              ref={upc}
              placeholder="12-digit-upc-code"
              style={{border: "1px solid blue",marginTop:"20px",height:"10vh",width:"90vw",background:"black", color:"white"}}
               />
            <br />
            <button 
              style={{background: "#000000", color:"blue", width: "45vw", height: "10vh"}}
              onClick={() => { update(upc.current.value) }}>go</button>

            <button 
              style={{background: "yellow", color:"blue", width: "45vw", height: "10vh", marginBottom:"20px"}}
              onClick={() => setScanning(!scanning) }>{scanning ? 'stop' : 'scan'}</button>


            <ul className="results">
                {results.map((result) => (result.codeResult && <Result key={result.codeResult.code} result={result} />))}
            </ul>
            <div ref={scannerRef} style={{position: 'relative', border: '3px solid red'}}>
                {/* <video style={{ width: window.innerWidth, height: 480, border: '3px solid orange' }}/> */}
                <div style={{position: 'absolute', top: '0px', opacity: '0.8', height: '100vh', width: '100vw' }}></div>
                <canvas className="drawingBuffer" style={{
                    position: 'absolute',
                    top: '0px',
                    // left: '0px',
                    height: '100vh',
                    width: '100vw',
                    opacity: '0.1',
                    border: '3px solid green',
                }} width="100vw" height="100vh" />
                {scanning ? <Scanner scannerRef={scannerRef} onDetected={(result) => updateScan(result) } /> : null}
            </div>
        </div>
    );
};

export default ScanWizard;
