import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { underControl } from '../redux/userRelated/userSlice';
import { underStudentControl } from '../redux/studentRelated/studentSlice';
import { message as antMessage } from 'antd';

const Popup = ({ message, setShowPopup, showPopup }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (showPopup) {
            if (message === "Done Successfully") {
                antMessage.success(message);
            } else {
                antMessage.error(message);
            }
            
            const timer = setTimeout(() => {
                setShowPopup(false);
                dispatch(underControl());
                dispatch(underStudentControl());
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [showPopup, message, setShowPopup, dispatch]);

    return null;
};

export default Popup;
