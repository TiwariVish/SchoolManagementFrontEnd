import React from 'react';
import { Table } from 'antd';

const TableTemplate = ({ buttonHaver: ButtonHaver, columns, rows }) => {
    
    const antdColumns = columns.map((col) => ({
        title: col.label,
        dataIndex: col.id,
        key: col.id,
        align: col.align,
        width: col.minWidth,
        render: (text) => (col.format && typeof text === 'number' ? col.format(text) : text)
    }));

    if (ButtonHaver) {
        antdColumns.push({
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => <ButtonHaver row={record} />
        });
    }

    return (
        <Table 
            columns={antdColumns} 
            dataSource={rows.map(row => ({ ...row, key: row.id }))} 
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

export default TableTemplate;