import React, { useEffect, useState } from "react";
import { getClassStudents, getSubjectDetails } from "../../../redux/sclassRelated/sclassHandle";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Tabs,
  Card,
  Table,
  Button,
  Typography,
  Dropdown,
  Menu,
  Popconfirm,
  message,
} from "antd";
import {
  EyeOutlined,
  UserAddOutlined,
  PlusOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const ViewSubject = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();

  const { subloading, subjectDetails, sclassStudents, getresponse, error } =
    useSelector((state) => state.sclass);

  const { classID, subjectID } = params;

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  if (error) console.log(error);

  const numberOfStudents = sclassStudents?.length || 0;

  // 🟢 Handlers
  const deleteHandler = (id) => {
    message.warning("Delete function disabled for now");
    console.log("Delete:", id);
  };

  // 🟢 Student Table Columns
  const studentColumns = [
    { title: "Roll No.", dataIndex: "rollNum", key: "rollNum" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Actions",
      key: "actions",
      render: (_, row) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() => navigate("/Admin/students/student/" + row.id)}
            >
              View
            </Menu.Item>
            <Menu.Item
              key="attendance"
              onClick={() =>
                navigate(`/Admin/subject/student/attendance/${row.id}/${subjectID}`)
              }
            >
              Take Attendance
            </Menu.Item>
            <Menu.Item
              key="marks"
              onClick={() =>
                navigate(`/Admin/subject/student/marks/${row.id}/${subjectID}`)
              }
            >
              Provide Marks
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined style={{ color: "red" }} />}>
              <Popconfirm
                title="Delete Student?"
                onConfirm={() => deleteHandler(row.id)}
                okText="Yes"
                cancelText="No"
              >
                Delete
              </Popconfirm>
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              icon={<EllipsisOutlined style={{ fontSize: "18px", transform: "rotate(90deg)" }} />}
            />
          </Dropdown>
        );
      },
    },
  ];

  const studentRows = sclassStudents?.map((student) => ({
    key: student._id,
    rollNum: student.rollNum,
    name: student.name,
    id: student._id,
  }));


  const SubjectDetailsSection = () => (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Subject Details
        </Title>
        {!subjectDetails?.teacher && (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() =>
              navigate("/Admin/teachers/addteacher/" + subjectDetails._id)
            }
          >
            Add Subject Teacher
          </Button>
        )}
      </div>

      <Table
        bordered
        showHeader={false}
        pagination={false}
        dataSource={[
          { key: "1", label: "Subject Name", value: subjectDetails?.subName },
          { key: "2", label: "Subject Code", value: subjectDetails?.subCode },
          { key: "3", label: "Sessions", value: subjectDetails?.sessions },
          { key: "4", label: "Number of Students", value: numberOfStudents },
          { key: "5", label: "Class Name", value: subjectDetails?.sclassName?.sclassName },
          {
            key: "6",
            label: "Teacher",
            value: subjectDetails?.teacher?.name || "Not Assigned",
          },
        ]}
        columns={[
          {
            title: "Label",
            dataIndex: "label",
            key: "label",
            width: "40%",
            render: (text) => <b>{text}</b>,
          },
          {
            title: "Value",
            dataIndex: "value",
            key: "value",
          },
        ]}
      />
    </Card>
  );

  // 🟢 Students Section
  const SubjectStudentsSection = () => (
    <Card
      title="Students List"
      extra={
        getresponse && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/Admin/class/addstudents/" + classID)}
          >
            Add Students
          </Button>
        )
      }
    >
      <Table
        columns={studentColumns}
        dataSource={studentRows}
        pagination={{ pageSize: 10 }}
        bordered
      />
    </Card>
  );

  return (
    <>
      {subloading ? (
        <div>Loading...</div>
      ) : (
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Details" key="1">
            <SubjectDetailsSection />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Students" key="2">
            <SubjectStudentsSection />
          </Tabs.TabPane>
        </Tabs>
      )}
    </>
  );
};

export default ViewSubject;
