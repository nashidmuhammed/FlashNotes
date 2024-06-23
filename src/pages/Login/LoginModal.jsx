import React, { useState } from 'react'
import Home from '../Home/Home'
import { Button, Checkbox, Form, Input, Modal, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { baseUrl } from '../../utils/GlobalVariable'
import Cookies from 'js-cookie';
import axios from 'axios'


const LoginModal = (props) => {
  const [form] = Form.useForm();
  const [isForgot, setIsForgot] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [isOTP, setIsOTP] = useState(false)
  const [loader, setLoader] = useState({
    is_login: false,
    is_register: false,
  })
  

  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    console.log('Received values of form: ', values.username);
    let payload = null

    if (isRegister && !isOTP){
      setLoader(prevState => ({ ...prevState, is_register: true }));
      payload = {
        'username':values.username,
        'email':values.email,
        'password1':values.password1,
        'password2':values.password2,
      }
      try {
          const response = await fetch(baseUrl+'v1/user/signup/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  // 'Authorization': 'Bearer your-auth-token',
              },
              body: JSON.stringify(payload ),
          })
          .then(response => response.json())
          .then(data => {
            console.log("data===>",data);
            if (data.status_code === 1000) {
                console.log('Registered successfully!');
                message.success(data.message)
                setIsOTP(true)
            }else if (data.status_code === 1001){
              console.log("data.message==>",data.message);
              let field_name = null
              if (!data.check_username){field_name = 'username'}
              else if (!data.check_email){field_name = 'email'}
              else if (!data.check_password){field_name = 'password1'}
              if (field_name){
                form.setFields([{
                    name: field_name,
                    errors: [data.message],
                  }]);
              }else{
                message.error(data.message)
              }
            } else {
                console.error('Failed to sync notes');
            }
  
          })
      } catch (error) {
          console.error('Error syncing notes:', error);
      } 
      setLoader(prevState => ({ ...prevState, is_register: false }));
    }else if (isOTP){
      payload = {
        'email':values.email,
        'otp':values.otp,
      }
      try {
          const response = await fetch(baseUrl+'v1/user/verify-email/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  // 'Authorization': 'Bearer your-auth-token',
              },
              body: JSON.stringify(payload ),
          })
          .then(response => response.json())
          .then(data => {
            console.log("data===>",data);
            if (data.status_code === 1000) {
                console.log('Registered successfully!');
                message.success(data.message)
                setIsOTP(false)
                setIsRegister(false)
                form.resetFields();
            }else if (data.status_code === 1001){
              console.log("data.message==>",data.message);
              let field_name = null
              if (data.message === 'Invalid OTP' || data.message === 'OTP has expired!'){field_name = 'otp'}
              if (field_name){
                form.setFields([{
                    name: field_name,
                    errors: [data.message],
                  }]);
              }else{
                message.error(data.message)
              }
            } else {
                console.error('Failed to sync notes');
            }
  
          })
      } catch (error) {
          console.error('Error syncing notes:', error);
      }
    }else {
      setLoader(prevState => ({ ...prevState, is_login: true }));
      payload = {
        'username':values.username,
        'password':values.password1,
      }
      try {
          const response = await fetch(baseUrl+'v1/user/login/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  // 'Authorization': 'Bearer your-auth-token',
              },
              body: JSON.stringify(payload ),
          })
          .then(response => response.json())
          .then(data => {
            console.log("data===>",data);
            if (data.status_code === 1000) {
                console.log('Login successfully!');
                message.success(data.message)
                props.setLoginOpen(false)

                // Set access and refresh tokens to cookies
                const accessToken = data.access;
                const refreshToken = data.refresh;
                Cookies.set('access', accessToken, { expires: 7 }); 
                Cookies.set('refresh', refreshToken, { expires: 30 }); 
                Cookies.set('user_id', data.user_id); 
                // Reset the form fields
                form.resetFields();
                getUserDetails();
            }else if (data.status_code === 1001){
              console.log("data.message==>",data.message);
              let field_name = null
              if (!data.is_username){field_name = 'username'}
              else if (!data.is_password){field_name = 'password1'}
              if (field_name){
                form.setFields([{
                    name: field_name,
                    errors: [data.message],
                  }]);
              }else{
                message.error(data.message)
              }
            } else {
                console.error('Failed to login');
            }
  
          })
      } catch (error) {
          console.error('Error login:', error);
      } 
      setLoader(prevState => ({ ...prevState, is_login: false }));
    }
  };


  const getUserDetails = async () => {
    const accessToken = Cookies.get('access');
    try {
      const response = await axios.get(baseUrl+'v1/user/get-user-details/', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('Protected API response:', response);
      Cookies.set('username', response.data.data.username); 
      Cookies.set('email', response.data.data.email); 
      Cookies.set('id', response.data.data.id); 
      props.setIsLoggedIn(true)

    } catch (error) {
      console.error('Error calling protected API:', error);
    }
  };

  return (
        <Modal
          title={<h2>{isRegister ? "Register Account" : "Account Login"}</h2>}
          centered
          open={props.loginOpen}
          onOk={() => props.setLoginOpen(false)}
          onCancel={() => props.setLoginOpen(false)}
          footer={null}
          maskClosable={false}
          // styles={{body:{background:'gray'}}}
        >
          <Form
            form={form}
            name="normal_login"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            {isRegister ?
            <>
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please input your Username!',
                },
              ]}
              // validateStatus={error.check_username && "error"}
              // help={error.check_username && "ERRORR"}
            >
              <Input disabled={isOTP} prefix={<UserOutlined  />} placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please input your Email!',
                },
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
              ]}
            >
              <Input disabled={isOTP} type='email' prefix={<UserOutlined  />} placeholder="Email" />
            </Form.Item>
            </>
            :
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please input your Username or Email!',
                },
              ]}
            >
              <Input prefix={<UserOutlined  />} placeholder="Username or Email" />
            </Form.Item>
            }
            {isOTP ?
              <Form.Item name='otp' label="OTP" hasFeedback >
                <Input.OTP />
              </Form.Item>
            :
              <>
                <Form.Item
                  name="password1"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Password!',
                    },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined  />}
                    type="password"
                    placeholder="Password"
                  />
                </Form.Item>
                {isRegister &&
                <Form.Item
                  name="password2"
                  dependencies={['password1']}
                  rules={[
                    {
                      required: true,
                      message: 'Please confirm your Password !',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password1') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The new password that you entered do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input
                    prefix={<LockOutlined  />}
                    type="password"
                    placeholder="Retype Password"
                  />
                </Form.Item>
                }
              </>
            }
            
              {!isRegister &&
              <a  href="" > Forgot password?    </a>
              }

            <Form.Item style={{marginTop:'10px'}}>
              {isRegister ? 
                <>
                <Button type="primary" block htmlType="submit" loading={loader.is_register} >
                  {isOTP ? "Verify OTP" :"Register"}
                </Button>
                <Button type="link" block onClick={() => {setIsRegister(false)}} >
                  Back to log in!
                </Button>
                </>
                :  
                <>
                <Button type="primary" block htmlType="submit" loading={loader.is_login} >
                  Log in
                </Button>
                <Button type="link" block onClick={() => {setIsRegister(true)}} >
                  Register now!
                </Button>
                </>
              }
               {/* <a href="">register now!</a> */}
            </Form.Item>
          </Form>
        </Modal>
  )
}

export default LoginModal