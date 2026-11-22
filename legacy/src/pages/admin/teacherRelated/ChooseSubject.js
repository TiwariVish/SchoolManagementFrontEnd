import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Typography, Card, Button, Spin, Result } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ChooseSubject = ({ situation }) => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [classID, setClassID] = useState("");
    const [teacherID, setTeacherID] = useState("");
    const [loader, setLoader] = useState(false);

    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);

    useEffect(() => {
        if (situation === "Norm") {
            setClassID(params.id);
            const classID = params.id;
            dispatch(getTeacherFreeClassSubjects(classID));
        }
        else if (situation === "Teacher") {
            const { classID, teacherID } = params;
            setClassID(classID);
            setTeacherID(teacherID);
            dispatch(getTeacherFreeClassSubjects(classID));
        }
    }, [situation, params, dispatch]);

    const updateSubjectHandler = (teacherId, teachSubject) => {
        setLoader(true);
        dispatch(updateTeachSubject(teacherId, teachSubject));
        navigate("/Admin/teachers");
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => index + 1,
            width: '10%'
        },
        {
            title: 'Subject Name',
            dataIndex: 'subName',
            key: 'subName',
            align: 'center'
        },
        {
            title: 'Subject Code',
            dataIndex: 'subCode',
            key: 'subCode',
            align: 'center'
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => {
                if (situation === "Norm") {
                    return (
                        <Button 
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => navigate("/Admin/teachers/addteacher/" + record._id)}
                        >
                            Choose
                        </Button>
                    );
                } else {
                    return (
                        <Button 
                            type="primary"
                            icon={<CheckOutlined />}
                            loading={loader}
                            onClick={() => updateSubjectHandler(teacherID, record._id)}
                        >
                            Choose Sub
                        </Button>
                    );
                }
            }
        }
    ];

    if (error) {
        console.log(error);
    }

    return (
        <div style={{ padding: '24px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : response ? (
                <Result
                    status="warning"
                    title="Sorry, all subjects have teachers assigned already."
                    extra={
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                        >
                            Add Subjects
                        </Button>
                    }
                />
            ) : (
                <Card title={<Title level={3} style={{ margin: 0 }}>Choose a subject</Title>}>
                    <Table 
                        columns={columns} 
                        dataSource={Array.isArray(subjectsList) ? subjectsList.map(sub => ({ ...sub, key: sub._id })) : []} 
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            )}
        </div>
    );
};

export default ChooseSubject;