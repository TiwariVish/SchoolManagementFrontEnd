import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Typography, Spin, Alert } from "antd";
import { getAllNotices } from "../redux/noticeRelated/noticeHandle";

const { Title } = Typography;

const SeeNotice = () => {
  const dispatch = useDispatch();

  const { currentUser, currentRole } = useSelector((state) => state.user);
  const { noticesList, loading, error, response } = useSelector(
    (state) => state.notice
  );

  useEffect(() => {
    if (currentRole === "Admin") {
      dispatch(getAllNotices(currentUser._id, "Notice"));
    } else {
      dispatch(getAllNotices(currentUser.school._id, "Notice"));
    }
  }, [dispatch, currentRole, currentUser]);

  if (error) {
    console.error(error);
  }

  // Ant Design columns
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      width: 400,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 150,
    },
  ];

  // Transform notices to table data
  const dataSource = noticesList.map((notice) => {
    const date = new Date(notice.date);
    const dateString =
      date.toString() !== "Invalid Date"
        ? date.toISOString().substring(0, 10)
        : "Invalid Date";
    return {
      key: notice._id,
      title: notice.title,
      details: notice.details,
      date: dateString,
    };
  });

  return (
    <div style={{ marginTop: "50px" }}>
      <Title level={3}>Notices</Title>

      {loading ? (
        <Spin tip="Loading..." size="large" />
      ) : response ? (
        <Alert
          message="No Notices to Show Right Now"
          type="info"
          showIcon
        />
      ) : (
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}
    </div>
  );
};

export default SeeNotice;
