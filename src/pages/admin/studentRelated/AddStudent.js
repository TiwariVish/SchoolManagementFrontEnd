import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../../redux/userRelated/userHandle";
import { underControl } from "../../../redux/userRelated/userSlice";
import { Form, Input, Button, Select, Spin, message as antMessage } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Option } = Select;

const AddStudent = ({ classId, closeModal }) => {
  const dispatch = useDispatch();
  const { currentUser, status, response } = useSelector((state) => state.user);
  const { sclassesList } = useSelector((state) => state.sclass);

  const adminID = currentUser._id;
  const role = "Student";
  const attendance = [];

  const [loader, setLoader] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (classId && sclassesList.length > 0) {
      const selectedClass = sclassesList.find((c) => c._id === classId);
      if (selectedClass) {
        form.setFieldsValue({ className: selectedClass.sclassName });
      }
    }
  }, [classId, sclassesList, form]);

  const onFinish = (values) => {
    setLoader(true);

    const sclass = classId
      ? classId
      : sclassesList.find((c) => c.sclassName === values.className)?._id;

    if (!sclass) {
      antMessage.error("Please select a valid class");
      setLoader(false);
      return;
    }

    const fields = {
      name: values.name,
      rollNum: values.rollNum,
      password: values.password,
      sclassName: sclass,
      adminID,
      role,
      attendance,
    };

    dispatch(registerUser(fields, role))
      .then(() => {
        dispatch(underControl());
        setLoader(false);
        antMessage.success("Student added successfully!");
        closeModal();
      })
      .catch(() => {
        setLoader(false);
        antMessage.error(response || "Failed to add student");
      });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ className: "" }}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please enter student's name" }]}
      >
        <Input placeholder="Enter student's name" />
      </Form.Item>

      {!classId && (
        <Form.Item
          label="Class"
          name="className"
          rules={[{ required: true, message: "Please select a class" }]}
        >
          <Select placeholder="Select Class">
            {sclassesList.map((c) => (
              <Option key={c._id} value={c.sclassName}>
                {c.sclassName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Form.Item
        label="Roll Number"
        name="rollNum"
        rules={[{ required: true, message: "Please enter roll number" }]}
      >
        <Input type="number" placeholder="Enter Roll Number" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please enter password" }]}
      >
        <Input.Password placeholder="Enter password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block disabled={loader}>
          {loader ? <Spin indicator={<LoadingOutlined />} /> : "Add Student"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddStudent;
