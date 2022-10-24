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
       props.firstLookup();
    };

    const updateScan = (result) => {
       var res = result.toString();
       props.setAccount(res);
       setScanning(false);
       props.firstLookup();
    };


    return (
        <div>
            <button onClick={() => setScanning(!scanning) }>{scanning ? 'Stop' : 'Start'}</button>
            <button onClick={() => { update(upc.current.value) }}>goto upc</button>

            <input
              type="text"
              ref={upc}
              className="form-control form-control-lg"
              placeholder="12-digit-upc-code"
              style={{width:"80%", background:"black"}}
               />



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
