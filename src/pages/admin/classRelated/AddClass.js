import React, { useEffect, useState } from "react";
import { Form, Input, Button, Spin, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addStuff } from "../../../redux/userRelated/userHandle";
import { underControl } from "../../../redux/userRelated/userSlice";
import { getAllSclasses } from "../../../redux/sclassRelated/sclassHandle"; 
import Classroom from "../../../assets/classroom.png"; 

const AddClass = ({ closeModal }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const userState = useSelector((state) => state.user);
  const { status, currentUser, response, error, tempDetails } = userState;

  const adminID = currentUser._id;
  const address = "Sclass";

  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    const fields = {
      sclassName: values.sclassName,
      adminID,
    };
    setLoading(true);
    dispatch(addStuff(fields, address));
  };

  useEffect(() => {
    if (status === "added" && tempDetails) {
      message.success("Class created successfully!");
      dispatch(underControl());
      setLoading(false);
      if (closeModal) closeModal();
      dispatch(getAllSclasses(adminID, "Sclass"));
    } else if (status === "failed") {
      message.error(response);
      setLoading(false);
    } else if (status === "error") {
      message.error("Network Error");
      setLoading(false);
    }
  }, [status, response, error, dispatch, tempDetails, adminID, closeModal]);

  return (
    <div style={{ textAlign: "center" }}>
      <img
        src={Classroom}
        alt="classroom"
        style={{ width: "80%", maxWidth: 300, marginBottom: 20 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="sclassName"
          label="Class Name"
          rules={[{ required: true, message: "Please enter class name!" }]}
        >
          <Input placeholder="Enter class name" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={loading}
          >
            {loading ? <Spin size="small" /> : "Create"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddClass;
