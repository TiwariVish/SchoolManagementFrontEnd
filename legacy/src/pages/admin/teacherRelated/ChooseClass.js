import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Typography, Spin, Card } from 'antd';
import { PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate } from 'react-router-dom';
import TableTemplate from '../../../components/TableTemplate';

const { Title, Text } = Typography;

const ChooseClass = ({ situation }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const navigateHandler = (classID) => {
        if (situation === "Teacher") {
            navigate("/Admin/teachers/choosesubject/" + classID);
        }
        else if (situation === "Subject") {
            navigate("/Admin/addsubject/" + classID);
        }
    };

    const sclassColumns = [
        { id: 'name', label: 'Class Name', minWidth: 170 },
    ];

    const sclassRows = sclassesList && sclassesList.length > 0 && sclassesList.map((sclass) => {
        return {
            name: sclass.sclassName,
            id: sclass._id,
        };
    });

    const SclassButtonHaver = ({ row }) => {
        return (
            <Button 
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => navigateHandler(row.id)}
            >
                Choose
            </Button>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : getresponse ? (
                <Card style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>No classes found.</Text>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => navigate("/Admin/addclass")}
                    >
                        Add Class
                    </Button>
                </Card>
            ) : (
                <Card title={<Title level={3} style={{ margin: 0 }}>Choose a class</Title>}>
                    {Array.isArray(sclassesList) && sclassesList.length > 0 && (
                        <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={sclassRows} />
                    )}
                </Card>
            )}
        </div>
    );
};

export default ChooseClass;