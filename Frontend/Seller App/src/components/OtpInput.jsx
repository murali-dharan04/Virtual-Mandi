import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";

const OtpInput = ({ length = 6, onComplete, disabled = false }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputs = useRef([]);

    useEffect(() => {
        if (inputs.current[0]) {
            inputs.current[0].focus();
        }
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value.substring(element.value.length - 1);
        setOtp(newOtp);

        // Move to next input if current field is filled
        if (element.value && index < length - 1) {
            inputs.current[index + 1].focus();
        }

        // Trigger onComplete if all fields are filled
        if (newOtp.every(val => val !== "") && onComplete) {
            onComplete(newOtp.join(""));
        }
    };

    const handleKeyDown = (e, index) => {
        // Move to previous input on backspace if current field is empty
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").trim();
        if (!data || isNaN(data)) return;

        const pasteData = data.split("").slice(0, length);
        const newOtp = [...otp];

        pasteData.forEach((char, i) => {
            newOtp[i] = char;
        });

        setOtp(newOtp);

        // Focus last filled or next empty
        const lastIndex = Math.min(pasteData.length, length - 1);
        inputs.current[lastIndex].focus();

        if (newOtp.every(val => val !== "") && onComplete) {
            onComplete(newOtp.join(""));
        }
    };

    return (
        <div className="flex justify-between gap-2 md:gap-4">
            {otp.map((data, index) => (
                <Input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    ref={(el) => (inputs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-full h-14 text-2xl font-black text-center rounded-2xl border-2 border-slate-100 bg-white/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
            ))}
        </div>
    );
};

export default OtpInput;
