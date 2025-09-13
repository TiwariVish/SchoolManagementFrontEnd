import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import {
    calculateOverallAttendancePercentage,
    calculateSubjectAttendancePercentage,
    groupAttendanceBySubject
} from '../../components/attendanceCalculator';
import { Table, Typography, Space, Spin } from 'antd';

const { Title, Text } = Typography;

const ViewStdAttendance = () => {
    const dispatch = useDispatch();
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, "Student"));
        }
    }, [dispatch, currentUser?._id]);

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    if (response) console.log(response);
    if (error) console.log(error);

    const attendanceBySubject = groupAttendanceBySubject(subjectAttendance);
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);


    const dataSource = Object.entries(attendanceBySubject).flatMap(([subName, { present, allData, subId, sessions }]) => {
        if (Array.isArray(allData) && allData.length > 0) {
            return allData.map((item, index) => ({
                key: `${subId}-${index}`,
                subId,
                subject: subName,
                attendedClasses: present,
                totalClasses: sessions,
                attendancePercentage: calculateSubjectAttendancePercentage(present, sessions),
                date: item.date,
                status: item.status
            }));
        } else {
            return [{
                key: subId,
                subId,
                subject: subName,
                attendedClasses: present,
                totalClasses: sessions,
                attendancePercentage: calculateSubjectAttendancePercentage(present, sessions),
                date: '-',
                status: '-'
            }];
        }
    });

    const columns = [
        { title: 'Subject', dataIndex: 'subject', key: 'subject' },
        { title: 'Present', dataIndex: 'attendedClasses', key: 'attendedClasses' },
        { title: 'Total Sessions', dataIndex: 'totalClasses', key: 'totalClasses' },
        { 
            title: 'Attendance', 
            dataIndex: 'attendancePercentage', 
            key: 'attendancePercentage', 
            render: val => `${val}%`
        },
        { 
            title: 'Date', 
            dataIndex: 'date', 
            key: 'date',
            render: date => {
                const d = new Date(date);
                return isNaN(d.getTime()) ? date : d.toISOString().substring(0, 10);
            }
        },
        { title: 'Status', dataIndex: 'status', key: 'status' }
    ];

    return (
        <div style={{ padding: 20 }}>
            {loading ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Spin size="large" />
                </Space>
            ) : (
                <>
                    {subjectAttendance && subjectAttendance.length > 0 ? (
                        <>
                            <Title level={3} style={{ textAlign: 'center' }}>Attendance</Title>
                            <Table
                                columns={columns}
                                dataSource={dataSource}
                                pagination={false}
                            />
                            <Text strong>Overall Attendance Percentage: {overallAttendancePercentage.toFixed(2)}%</Text>
                        </>
                    ) : (
                        <Title level={4} style={{ textAlign: 'center' }}>Currently You Have No Attendance Details</Title>
                    )}
                </>
            )}
        </div>
    );
};

export default ViewStdAttendance;
