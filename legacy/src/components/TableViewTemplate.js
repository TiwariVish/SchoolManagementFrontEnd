import React from 'react';
import { Table } from 'antd';

const TableViewTemplate = ({ columns, rows }) => {
    
    const antdColumns = columns.map((col) => ({
        title: col.label,
        dataIndex: col.id,
        key: col.id,
        align: col.align,
        width: col.minWidth,
        render: (text) => (col.format && typeof text === 'number' ? col.format(text) : text)
    }));

    return (
        <Table 
            columns={antdColumns} 
            dataSource={rows.map((row, index) => ({ ...row, key: row.id || index }))} 
            pagination={{
                defaultPageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '25', '100']
            }}
            scroll={{ x: 'max-content' }}
            bordered
            style={{ marginTop: '20px' }}
        />
    )
}

export default TableViewTemplate;