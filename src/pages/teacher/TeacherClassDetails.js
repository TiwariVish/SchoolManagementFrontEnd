import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Table, Typography, Dropdown, Menu, Space, Modal } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import StudentAttendance from "../admin/studentRelated/StudentAttendance";

const TeacherClassDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sclassStudents, loading, error, getresponse } = useSelector(
    (state) => state.sclass
  );
  const { currentUser } = useSelector((state) => state.user);

  const classID = currentUser.teachSclass?._id;
  const subjectID = currentUser.teachSubject?._id;

  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (classID) {
      dispatch(getClassStudents(classID));
    }
  }, [dispatch, classID]);

  if (error) console.log(error);


  const handleOpenAttendance = (student) => {
    setSelectedStudent(student);
    setAttendanceModalVisible(true);
  };


  const handleCloseAttendance = () => {
    setAttendanceModalVisible(false);
    setSelectedStudent(null);
  };

  const getMenu = (row) => (
    <Menu
      items={[
        {
          key: "view",
          label: "View",
          onClick: () => navigate(`/Teacher/class/student/${row._id}`),
        },
        {
          key: "attendance",
          label: "Take Attendance",
          onClick: () => handleOpenAttendance(row), 
        },
        {
          key: "marks",
          label: "Provide Marks",
          onClick: () =>
            navigate(`/Teacher/class/student/marks/${row._id}/${subjectID}`),
        },
      ]}
    />
  );


  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Roll Number",
      dataIndex: "rollNum",
      key: "rollNum",
    },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <Dropdown overlay={getMenu(row)} trigger={["click"]}>
          <Space style={{ cursor: "pointer" }}>
            <MoreOutlined style={{ fontSize: "18px" }} />
          </Space>
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <Typography.Title level={3} style={{ textAlign: "center" }}>
        Class Details
      </Typography.Title>

      {loading ? (
        <Typography.Text>Loading...</Typography.Text>
      ) : getresponse ? (
        <Typography.Text>No Students Found</Typography.Text>
      ) : (
        <Table
          columns={columns}
          dataSource={sclassStudents.map((student) => ({
            key: student._id,
            ...student,
          }))}
          pagination={{ pageSize: 8 }}
          bordered
        />
      )}
     <Modal
  open={attendanceModalVisible}
  onCancel={handleCloseAttendance}
  footer={null}
  width={800}
>
  {selectedStudent && (
    <StudentAttendance
      studentId={selectedStudent._id}  
      subjectId={subjectID}           
      situation="Subject"               
      onClose={handleCloseAttendance}   
    />
  )}
</Modal>

    </div>
  );
};

export default TeacherClassDetails;
