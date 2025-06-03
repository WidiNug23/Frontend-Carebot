import React, { useEffect } from 'react';
import './Chatbot.css'; // Ensure this CSS file is present for any additional styling

const Chatbot = () => {
  useEffect(() => {
    // Load the Dialogflow Messenger script if needed
    const scriptId = 'dialogflow-messenger';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
      script.id = scriptId;
      document.body.appendChild(script);
    }

    // Apply CSS to customize the chat window colors
    const style = document.createElement('style');
    style.innerHTML = `
 df-messenger {
  --df-messenger-bot-message: #4A7C2E; /* Dark green for bot messages */
  --df-messenger-button-titlebar-color: #3aaf2c; /* Orange for titlebar button */
  --df-messenger-button-titlebar-text-color: #FFFFFF; /* White for title text */
  --df-messenger-chat-background-color: #C9E0B6; /* Very light green for chat background */
  --df-messenger-font-color: #FFFFFF; /* White for readable font */
  --df-messenger-send-icon: #5F9B4C; /* Medium green for send icon */
  --df-messenger-user-message:rgb(13, 159, 47); /* Dark green for user messages */
}



      df-messenger[hidden] {
        display: none; /* Hide the default chat icon */
      }
    `;
    document.head.appendChild(style);

    // Cleanup style on component unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);  

  return (
    <div>
      {/* Chat Window */}
      <df-messenger
        chat-icon="https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/chat-icon.png"
        intent="WELCOME"
        chat-title="CareBot"
        agent-id="2b375627-4601-495e-be1a-792f88069133" // Replace with correct agent ID
        language-code="id"
      ></df-messenger>
    </div>
  );
};

export default Chatbot;
