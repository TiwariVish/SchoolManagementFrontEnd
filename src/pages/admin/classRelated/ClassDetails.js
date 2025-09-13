import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClassDetails,
  getClassStudents,
  getSubjectList,
} from "../../../redux/sclassRelated/sclassHandle";
import { Table, Button, Tabs, Popconfirm, Typography, Space, Dropdown, Menu, Drawer } from "antd";
import {
  DeleteOutlined,
  UserAddOutlined,
  FileAddOutlined,
  EyeOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import Popup from "../../../components/Popup";
import SubjectForm from "../subjectRelated/SubjectForm";


const { Text } = Typography;
const { TabPane } = Tabs;

const ClassDetails = () => {
  const { id: classID } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjectsList, sclassStudents, sclassDetails, loading } = useSelector(
    (state) => state.sclass
  );

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  useEffect(() => {
    dispatch(getClassDetails(classID, "Sclass"));
    dispatch(getSubjectList(classID, "ClassSubjects"));
    dispatch(getClassStudents(classID));
  }, [dispatch, classID]);

  const deleteHandler = (id, type) => {
    setPopupMessage("Sorry, the delete function has been disabled for now.");
    setShowPopup(true);
  };

  // ===== TABLE COLUMNS =====
  const detailsColumns = [
    { title: "Class Name", dataIndex: "name", key: "name" },
    { title: "Number of Subjects", dataIndex: "subjects", key: "subjects" },
    { title: "Number of Students", dataIndex: "students", key: "students" },
  ];

  const subjectColumns = [
    { title: "Subject Name", dataIndex: "subName", key: "subName" },
    { title: "Subject Code", dataIndex: "subCode", key: "subCode" },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() =>
                navigate(`/Admin/class/subject/${classID}/${record.id}`)
              }
            >
              View
            </Menu.Item>
            <Menu.Item
              key="delete"
              icon={<DeleteOutlined style={{ color: "red" }} />}
              onClick={() => deleteHandler(record.id, "Subject")}
            >
              Delete
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              icon={
                <EllipsisOutlined
                  style={{ fontSize: "18px", transform: "rotate(90deg)" }}
                />
              }
              style={{ padding: 0 }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const studentColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Roll Number", dataIndex: "rollNum", key: "rollNum" },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/Admin/students/student/${record.id}`)}
            >
              View
            </Menu.Item>
            <Menu.Item
              key="delete"
              icon={<DeleteOutlined style={{ color: "red" }} />}
              onClick={() => deleteHandler(record.id, "Student")}
            >
              Delete
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              icon={<EllipsisOutlined style={{ fontSize: "18px", transform: "rotate(90deg)" }} />}
              style={{ padding: 0 }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const teachersColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Subject", dataIndex: "subject", key: "subject" },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EyeOutlined />} />
          <Popconfirm
            title="Delete this teacher?"
            onConfirm={() => deleteHandler(record.id, "Teacher")}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ===== TABLE DATA =====
  const detailsData = [
    {
      key: classID,
      name: sclassDetails?.sclassName || "-",
      subjects: subjectsList.length,
      students: sclassStudents.length,
    },
  ];

  const subjectData =
    subjectsList?.map((sub) => ({
      key: sub._id,
      id: sub._id,
      subName: sub.subName,
      subCode: sub.subCode,
    })) || [];

  const studentData =
    sclassStudents?.map((student) => ({
      key: student._id,
      id: student._id,
      name: student.name,
      rollNum: student.rollNum,
    })) || [];

  const teachersData = [];

  return (
    <>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Tabs defaultActiveKey="1">
          <TabPane tab="Details" key="1">
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate(`/Admin/class/addstudents/${classID}`)}
                style={{ marginRight: 8 }}
              >
                Add Students
              </Button>
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                onClick={openDrawer}
              >
                Add Subjects
              </Button>
            </div>
            <Table
              columns={detailsColumns}
              dataSource={detailsData}
              pagination={false}
              bordered
              showHeader={detailsData.length > 0}
              locale={{ emptyText: "No Classes Found" }}
            />
          </TabPane>

       
          <TabPane tab="Subjects" key="2">
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                onClick={openDrawer}
              >
                Add Subject
              </Button>
            </div>
            <Table
              columns={subjectColumns}
              dataSource={subjectData}
              pagination={false}
              bordered
              showHeader={subjectData.length > 0}
              locale={{ emptyText: "No Subjects Found" }}
            />
          </TabPane>

    
          <TabPane tab="Students" key="3">
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate(`/Admin/class/addstudents/${classID}`)}
              >
                Add Student
              </Button>
            </div>
            <Table
              columns={studentColumns}
              dataSource={studentData}
              pagination={false}
              bordered
              showHeader={studentData.length > 0}
              locale={{ emptyText: "No Students Found" }}
            />
          </TabPane>

        
          <TabPane tab="Teachers" key="4">
            <Table
              columns={teachersColumns}
              dataSource={teachersData}
              pagination={false}
              bordered
              showHeader={teachersData.length > 0}
              locale={{ emptyText: "No Teachers Found" }}
            />
          </TabPane>
        </Tabs>
      )}

      <Popup message={popupMessage} setShowPopup={setShowPopup} showPopup={showPopup} />

    
      <Drawer
        title="Add Subjects"
        placement="right"
        width={500}
        onClose={closeDrawer}
        open={drawerVisible}
        destroyOnClose
        footer={null}
      >
        <SubjectForm closeDrawer={closeDrawer} sclassName={classID} />
      </Drawer>
    </>
  );
};

export default ClassDetails;
