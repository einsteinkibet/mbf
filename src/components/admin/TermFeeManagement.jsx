import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Modal, DatePicker, Input, Select, message, Card } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { termAPI, gradeAPI } from '../../services/api';

const { Option } = Select;
const { RangePicker } = DatePicker;

const TermFeeManagement = () => {
  const [terms, setTerms] = useState([]);
  const [grades, setGrades] = useState([]);
  const [fees, setFees] = useState([]);
  const [isTermModalVisible, setIsTermModalVisible] = useState(false);
  const [isFeeModalVisible, setIsFeeModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [feeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);
  const [activeTermId, setActiveTermId] = useState(null);


  // Fetch terms and grades on component mount
  useEffect(() => {
    fetchTerms();
    fetchGrades();
  }, []);

  useEffect(() => {
    if (activeTermId) {
      fetchFees(activeTermId);
    }
  }, [activeTermId]);


const fetchTerms = async () => {
  setLoading(true);
  try {
    const response = await termAPI.getAll();
    setTerms(response.data);
    
    const activeTerm = response.data.find(term => term.is_active);
    if (activeTerm) setActiveTermId(activeTerm.id);
  } catch (error) {
    console.error('Error fetching terms:', error);
    message.error('Failed to fetch terms');
  } finally {
    setLoading(false);
  }
};

const fetchGrades = async () => {
  try {
    const response = await gradeAPI.getAll();
    setGrades(response.data);
  } catch (error) {
    console.error('Error fetching grades:', error);
    message.error('Failed to fetch grades');
  }
};

const handleTermSubmit = async () => {
  try {
    const values = await form.validateFields();
    const termData = {
      name: values.name,
      start_date: values.dates[0].format('YYYY-MM-DD'),
      end_date: values.dates[1].format('YYYY-MM-DD')
    };

    await termAPI.create(termData);
    message.success('Term created successfully');
    fetchTerms();
    setIsTermModalVisible(false);
    form.resetFields();
  } catch (error) {
    console.error('Error creating term:', error);
    message.error(error.response?.data?.error || 'Failed to create term');
  }
};

  const fetchFees = async (termId) => {
    setFeeLoading(true);
    try {
      const response = await feeAPI.getAll(termId);
      setFees(response.data);
    } catch (error) {
      console.error('Error fetching fees:', error);
      message.error('Failed to fetch fees');
    } finally {
      setFeeLoading(false);
    }
  };
  
  const handleFeeSubmit = async () => {
    try {
      const values = await feeForm.validateFields();
      const feeData = {
        term_id: values.term_id,
        grade_id: values.grade_id,
        amount: values.amount
      };
  
      if (values.id) {
        await feeAPI.update(values.id, feeData);
        message.success('Fee updated successfully');
      } else {
        await feeAPI.create(feeData);
        message.success('Fee added successfully');
      }
      
      fetchFees(feeData.term_id);
      setIsFeeModalVisible(false);
      feeForm.resetFields();
    } catch (error) {
      console.error('Error saving fee:', error);
      message.error(error.response?.data?.message || 'Failed to save fee');
    }
  };

  const handleRollover = async () => {
    try {
      await termAPI.processRollover();
      message.success('Term rollover processed successfully');
      fetchTerms();
    } catch (error) {
      console.error('Error processing rollover:', error);
      message.error('Failed to process rollover');
    }
  };

  const handlePromoteStudents = async () => {
    try {
      await termAPI.promoteStudents();
      message.success('Students promoted successfully');
    } catch (error) {
      console.error('Error promoting students:', error);
      message.error('Failed to promote students');
    }
  };
  const termColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: date => dayjs(date).format('MMMM D, YYYY'),
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: date => dayjs(date).format('MMMM D, YYYY'),
    },
    {
      title: 'Status',
      key: 'is_active',
      render: (_, record) => (
        <span style={{ color: record.is_active ? 'green' : 'gray' }}>
          {record.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const feeColumns = [
    {
      title: 'Grade',
      dataIndex: 'grade_name',
      key: 'grade_name',
    },
    {
      title: 'Term',
      dataIndex: 'term_name',
      key: 'term_name',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => handleEditFee(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const handleEditFee = (fee) => {
    feeForm.setFieldsValue({
      id: fee.id,
      term_id: fee.term_id,
      grade_id: fee.grade_id,
      amount: fee.amount
    });
    setIsFeeModalVisible(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Term Management" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Button 
            type="primary" 
            onClick={() => setIsTermModalVisible(true)}
            style={{ marginRight: '8px' }}
          >
            Create New Term
          </Button>
          <Button 
            onClick={handleRollover}
            style={{ marginRight: '8px' }}
            danger
          >
            Process Term Rollover
          </Button>
          <Button 
            onClick={handlePromoteStudents}
            type="dashed"
          >
            Promote Students
          </Button>
        </div>

        <Table 
          columns={termColumns} 
          dataSource={terms} 
          rowKey="id" 
          loading={loading}
          pagination={false}
        />
      </Card>

      <Card title="Fee Management">
        <div style={{ marginBottom: '16px' }}>
          <Button 
            type="primary" 
            onClick={() => setIsFeeModalVisible(true)}
          >
            Add New Fee
          </Button>
        </div>

        <Table 
          columns={feeColumns} 
          dataSource={fees} 
          rowKey="id" 
          loading={feeLoading}
          pagination={false}
        />
      </Card>

      {/* Term Creation Modal */}
      <Modal
        title="Create New Term"
        open={isTermModalVisible}
        onOk={handleTermSubmit}
        onCancel={() => setIsTermModalVisible(false)}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Term Name"
            rules={[{ required: true, message: 'Please input term name!' }]}
          >
            <Input placeholder="e.g., Fall 2023" />
          </Form.Item>
          <Form.Item
            name="dates"
            label="Term Dates"
            rules={[{ required: true, message: 'Please select term dates!' }]}
          >
            <RangePicker 
              style={{ width: '100%' }} 
              disabledDate={current => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Fee Creation Modal */}
      <Modal
        title="Add/Edit Fee"
        open={isFeeModalVisible}
        onOk={handleFeeSubmit}
        onCancel={() => {
          setIsFeeModalVisible(false);
          feeForm.resetFields();
        }}
        okText="Save"
      >
        <Form form={feeForm} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="term_id"
            label="Term"
            rules={[{ required: true, message: 'Please select a term!' }]}
          >
            <Select placeholder="Select term">
              {terms.map(term => (
                <Option key={term.id} value={term.id}>
                  {term.name} ({dayjs(term.start_date).format('MMM D')} - {dayjs(term.end_date).format('MMM D, YYYY')})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="grade_id"
            label="Grade"
            rules={[{ required: true, message: 'Please select a grade!' }]}
          >
            <Select placeholder="Select grade">
              {grades.map(grade => (
                <Option key={grade.id} value={grade.id}>
                  {grade.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ 
              required: true, 
              pattern: new RegExp(/^\d+(\.\d{1,2})?$/),
              message: 'Please enter a valid amount'
            }]}
          >
            <Input prefix="$" type="number" step="0.01" min="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TermFeeManagement;