import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { deleteUser } from "../../../redux/userRelated/userHandle";
import {
  Table,
  Button,
  Dropdown,
  Menu,
  Popconfirm,
  FloatButton,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import Popup from "../../../components/Popup";

const ShowSubjects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjectsList, loading, error, response } = useSelector(
    (state) => state.sclass
  );
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getSubjectList(currentUser._id, "AllSubjects"));
  }, [currentUser._id, dispatch]);

  if (error) {
    console.log(error);
  }

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const deleteHandler = (deleteID, address) => {
    console.log(deleteID, address);
    setPopupMessage("Sorry the delete function has been disabled for now.");
    setShowPopup(true);

    // dispatch(deleteUser(deleteID, address)).then(() => {
    //   dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    // });
  };

  // ✅ Ant Design Table Columns with Vertical Dots Dropdown
  const columns = [
    {
      title: "Subject Name",
      dataIndex: "subName",
      key: "subName",
    },
    {
      title: "Sessions",
      dataIndex: "sessions",
      key: "sessions",
    },
    {
      title: "Class",
      dataIndex: "sclassName",
      key: "sclassName",
    },
    {
      title: "Actions",
      key: "actions",
      align: "right", // ✅ Align to right
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() =>
                navigate(`/Admin/subjects/subject/${record.sclassID}/${record.id}`)
              }
            >
              View
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined style={{ color: "red" }} />}>
              <Popconfirm
                title="Delete Subject?"
                description="Are you sure you want to delete this subject?"
                onConfirm={() => deleteHandler(record.id, "Subject")}
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

  // ✅ Table Data
  const dataSource = Array.isArray(subjectsList)
    ? subjectsList.map((subject) => ({
        key: subject._id,
        subName: subject.subName,
        sessions: subject.sessions,
        sclassName: subject.sclassName?.sclassName,
        sclassID: subject.sclassName?._id,
        id: subject._id,
      }))
    : [];

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {response ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                margin: "16px 0",
              }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/Admin/subjects/chooseclass")}
              >
                Add Subjects
              </Button>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={dataSource}
                pagination={{ pageSize: 10 }}
                bordered
              />

              {/* ✅ Floating Buttons */}
              <FloatButton.Group shape="circle" style={{ right: 24 }}>
                <FloatButton
                  icon={<PlusOutlined />}
                  tooltip="Add New Subject"
                  onClick={() => navigate("/Admin/subjects/chooseclass")}
                />
                <FloatButton
                  icon={<DeleteOutlined />}
                  tooltip="Delete All Subjects"
                  onClick={() => deleteHandler(currentUser._id, "Subjects")}
                />
              </FloatButton.Group>
            </>
          )}
        </>
      )}

      <Popup
        message={popupMessage}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </>
  );
};

export default ShowSubjects;
