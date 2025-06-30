import React, { useState } from "react";
import axios from "axios";
import { messageAPI } from '../../services/api';

const Messages = () => {
    const [threshold, setThreshold] = useState("");
    const [customMessage, setCustomMessage] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    
    const sendThresholdMessages = async () => {
      setIsSending(true);
      try {
        await messageAPI.sendReminders({ threshold });
        setSuccessMessage(`Threshold messages sent to all parents with balance above ${threshold}!`);
        setTimeout(() => setSuccessMessage(""), 5000);
      } catch (error) {
        console.error("Error sending messages:", error);
        setSuccessMessage("Failed to send messages. Please try again.");
      } finally {
        setIsSending(false);
      }
    };
    
    const sendCustomMessage = async () => {
      setIsSending(true);
      try {
        await messageAPI.sendCustom({ 
          phoneNumber, 
          message: customMessage 
        });
        setSuccessMessage(`Custom message sent to ${phoneNumber}!`);
        setTimeout(() => setSuccessMessage(""), 5000);
        setCustomMessage("");
        setPhoneNumber("");
      } catch (error) {
        console.error("Error sending message:", error);
        setSuccessMessage("Failed to send message. Please check the phone number.");
      } finally {
        setIsSending(false);
      }
    };

    return (
        <div className="messaging-container">
            <div className="messaging-header">
                <h2>Parent Communication Portal</h2>
                <p>Send automated reminders or custom messages to parents</p>
            </div>

            {successMessage && (
                <div className="alert success">
                    <span>✓</span> {successMessage}
                </div>
            )}

            <div className="messaging-card">
                <div className="card-header">
                    <h3>Balance Reminders</h3>
                    <p>Send automated messages to all parents with balance above threshold</p>
                </div>
                <div className="form-group">
                    <label>Balance Threshold</label>
                    <input 
                        type="number" 
                        placeholder="Enter amount (e.g., 5000)" 
                        value={threshold} 
                        onChange={(e) => setThreshold(e.target.value)} 
                    />
                </div>
                <button 
                    onClick={sendThresholdMessages}
                    disabled={!threshold || isSending}
                    className="primary-btn"
                >
                    {isSending ? 'Sending...' : 'Send Reminders'}
                </button>
            </div>

            <div className="messaging-card">
                <div className="card-header">
                    <h3>Custom Message</h3>
                    <p>Send a personalized message to a specific parent</p>
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                        type="text" 
                        placeholder="+254700123456" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                    />
                </div>
                <div className="form-group">
                    <label>Message Content</label>
                    <textarea 
                        placeholder="Type your message here..." 
                        value={customMessage} 
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows="4"
                    />
                </div>
                <button 
                    onClick={sendCustomMessage}
                    disabled={!phoneNumber || !customMessage || isSending}
                    className="primary-btn"
                >
                    {isSending ? 'Sending...' : 'Send Message'}
                </button>
            </div>

            <style jsx>{`
                .messaging-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .messaging-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .messaging-header h2 {
                    color: #2c3e50;
                    margin-bottom: 0.5rem;
                }

                .messaging-header p {
                    color: #7f8c8d;
                    margin-top: 0;
                }

                .messaging-card {
                    background: white;
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                }

                .card-header h3 {
                    color: #3498db;
                    margin-top: 0;
                    margin-bottom: 0.5rem;
                }

                .card-header p {
                    color: #95a5a6;
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #2c3e50;
                    font-weight: 500;
                }

                input, textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
                }

                textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .primary-btn {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.3s ease;
                    width: 100%;
                }

                .primary-btn:hover {
                    background: #2980b9;
                }

                .primary-btn:disabled {
                    background: #bdc3c7;
                    cursor: not-allowed;
                }

                .alert {
                    padding: 1rem;
                    border-radius: 6px;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .alert.success {
                    background: #e8f8f5;
                    color: #27ae60;
                    border: 1px solid #2ecc71;
                }

                @media (max-width: 600px) {
                    .messaging-container {
                        padding: 1rem;
                    }

                    .messaging-card {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Messages;