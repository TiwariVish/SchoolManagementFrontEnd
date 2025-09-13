import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';

import {
    Box,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Stack,
    TextField,
    CircularProgress,
    FormControl
} from '@mui/material';
import { PurpleButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';

const StudentAttendance = ({ situation, studentId, subjectId, onClose }) => {
    const dispatch = useDispatch();
    const { currentUser, userDetails, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const { response, error, statestatus } = useSelector((state) => state.student);

    const [studentID, setStudentID] = useState(studentId || "");
    const [chosenSubName, setChosenSubName] = useState(subjectId || "");
    const [subjectName, setSubjectName] = useState("");
    const [status, setStatus] = useState("");
    const [date, setDate] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        if (studentId) {
            setStudentID(studentId);
            dispatch(getUserDetails(studentId, "Student"));
        }
    }, [studentId, dispatch]);


    useEffect(() => {
        if (userDetails?.sclassName && situation === "Student") {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails, situation]);


    const changeHandler = (event) => {
        const selectedSubject = subjectsList.find(
            (subject) => subject.subName === event.target.value
        );
        setSubjectName(selectedSubject.subName);
        setChosenSubName(selectedSubject._id);
    };

    const fields = { subName: chosenSubName, status, date };


    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(updateStudentFields(studentID, fields, "StudentAttendance"));
    };


    useEffect(() => {
        if (response || statestatus === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage(response || "Attendance saved successfully!");
            if (onClose) onClose(); 
        } else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Error saving attendance");
        }
    }, [response, statestatus, error, onClose]);

    return (
        <>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box
                    sx={{
                        flex: '1 1 auto',
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: 550,
                            px: 3,
                            py: '50px',
                            width: '100%',
                        }}
                    >
                        <Stack spacing={1} sx={{ mb: 3 }}>
                            <Typography variant="h4">
                                Student Name: {userDetails?.name}
                            </Typography>
                            {currentUser.teachSubject && (
                                <Typography variant="h4">
                                    Subject Name: {currentUser.teachSubject?.subName}
                                </Typography>
                            )}
                        </Stack>

                        <form onSubmit={submitHandler}>
                            <Stack spacing={3}>
                                {situation === "Student" && (
                                    <FormControl fullWidth>
                                        <InputLabel>Select Subject</InputLabel>
                                        <Select
                                            value={subjectName}
                                            label="Choose Subject"
                                            onChange={changeHandler}
                                            required
                                        >
                                            {subjectsList?.length > 0 ? (
                                                subjectsList.map((subject) => (
                                                    <MenuItem key={subject._id} value={subject.subName}>
                                                        {subject.subName}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem value="">
                                                    No Subjects Available
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                )}

                                <FormControl fullWidth>
                                    <InputLabel>Attendance Status</InputLabel>
                                    <Select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        required
                                    >
                                        <MenuItem value="Present">Present</MenuItem>
                                        <MenuItem value="Absent">Absent</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <TextField
                                        label="Select Date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                    />
                                </FormControl>
                            </Stack>

                            <PurpleButton
                                fullWidth
                                size="large"
                                sx={{ mt: 3 }}
                                variant="contained"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                            </PurpleButton>
                        </form>
                    </Box>
                </Box>
            )}

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default StudentAttendance;
