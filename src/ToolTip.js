import React from 'react';
import { useState } from 'react';

function ToolTip() {

    const [showExtraText, setShowExtraText] = useState(false);
    const handleClick = () => {
        if (showExtraText) {
            setShowExtraText(false);
        } else {
            setShowExtraText(true);
        }
      };

  return (
    <div style={{marginTop: '2rem'}}>
        <p onClick={handleClick} style={{textDecoration: 'underline', fontStyle: 'italic', cursor: 'pointer'}}>What even the heck is Ultimate FizzBuzz?</p>
        {showExtraText && <p>Why don't you try playing the game and find out</p>}
    </div>
  );
}

export default ToolTip;
