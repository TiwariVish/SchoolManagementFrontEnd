import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Menu,
  Dropdown,
  message,
  Spin,
  Modal,
  Drawer,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  UserAddOutlined,
  FileAddOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "../../../redux/userRelated/userHandle";
import { getAllSclasses } from "../../../redux/sclassRelated/sclassHandle";
import AddClass from "./AddClass";
import AddStudent from "../studentRelated/AddStudent";
import SubjectForm from "../subjectRelated/SubjectForm";

const ShowClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sclassesList, loading, error } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector((state) => state.user);

  const adminID = currentUser._id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  useEffect(() => {
    dispatch(getAllSclasses(adminID, "Sclass"));
  }, [adminID, dispatch]);

  if (error) {
    console.log(error);
  }

  const deleteHandler = (deleteID, address) => {
    message.warning("Sorry, the delete function has been disabled for now.");
    // dispatch(deleteUser(deleteID, address)).then(() => {
    //   dispatch(getAllSclasses(adminID, "Sclass"));
    // });
  };

  const SclassActions = ({ row }) => {
    const menu = (
      <Menu>
        <Menu.Item
          key="view"
          icon={<EyeOutlined />}
          onClick={() => navigate("/Admin/classes/class/" + row.id)}
        >
          View
        </Menu.Item>
        <Menu.Item
          key="delete"
          danger
          icon={<DeleteOutlined />}
          onClick={() => deleteHandler(row.id, "Sclass")}
        >
          Delete
        </Menu.Item>
        <Menu.Item
          key="add-subject"
          icon={<FileAddOutlined />}
          onClick={() => {
            setSelectedClassId(row.id);
            setIsAddSubjectModalOpen(true);
          }}
        >
          Add Subjects
        </Menu.Item>
        <Menu.Item
          key="add-student"
          icon={<UserAddOutlined />}
          onClick={() => {
            setSelectedClassId(row.id);
            setIsAddStudentModalOpen(true);
          }}
        >
          Add Student
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    );
  };

  const columns = [
    {
      title: "Class Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, row) => <SclassActions row={row} />,
    },
  ];

  const data =
    Array.isArray(sclassesList) &&
    sclassesList.map((sclass) => ({
      key: sclass._id,
      name: sclass.sclassName,
      id: sclass._id,
    }));

  return (
    <>
      {loading ? (
        <Spin tip="Loading classes..." />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 16,
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Class
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            locale={{ emptyText: "No Classes Found" }}
          />
        </>
      )}

      <Modal
        title="Create New Class"
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <AddClass closeModal={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        title="Add Students"
        open={isAddStudentModalOpen}
        footer={null}
        onCancel={() => setIsAddStudentModalOpen(false)}
        destroyOnClose
      >
        <AddStudent
          classId={selectedClassId}
          closeModal={() => setIsAddStudentModalOpen(false)}
        />
      </Modal>

    <Drawer
  title="Add Subjects"
  placement="right"
  width={500}
  onClose={() => setIsAddSubjectModalOpen(false)}
  open={isAddSubjectModalOpen}
  destroyOnClose
>
  <SubjectForm
    classId={selectedClassId}   
    closeModal={() => setIsAddSubjectModalOpen(false)}
  />
</Drawer>
    </>
  );
};

export default ShowClasses;
