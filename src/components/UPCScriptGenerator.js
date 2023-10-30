import React, { useState } from 'react';

function UPCScriptGenerator() {
  const [inputText, setInputText] = useState('');
  const [upcScript, setUPCScript] = useState('');

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const generateUPCScript = () => {
    const lines = inputText.split('\n');
    const upcScriptLines = [];

    for (const line of lines) {
      if (line.includes('youtu.be/')) {
        const videoIdentifier = line.split('youtu.be/')[1].split('?')[0];
        upcScriptLines.push(videoIdentifier);
      }
      else {
        upcScriptLines.push(line);
      }
    }

    const concatenatedUPCScript = 'ss >>>' + upcScriptLines.join('>');
    setUPCScript(concatenatedUPCScript.replace(/\s/g, '')); // Remove spaces
  };

  return (
    <div style={{background:"black"}}>
      <textarea
        style={{background:"black", color:"green"}}
        rows="20"
        cols="50"
        value={inputText}
        onChange={handleInputChange}
        placeholder="Enter one URL per line"
      ></textarea>
      <button onClick={generateUPCScript}>Create UPCScript</button>
      <p>{upcScript}</p>
    </div>
  );
}

export default UPCScriptGenerator;
