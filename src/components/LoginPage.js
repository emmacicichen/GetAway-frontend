import React from "react";
import { Form, Button, Input, Space, Checkbox, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { login, register } from "../utils";
//先看render！
class LoginPage extends React.Component {
    formRef = React.createRef();//1。 init
    state = {
        asHost: false,
        loading: false,
    };

    onFinish = () => {
        console.log("finish form");
    };

    handleLogin = async () => {
        const formInstance = this.formRef.current;
//await  async  -》 syntex sugar
// await a
// await b
// let c = 1;
// await a .then .then(c = 1)
        try {
            await formInstance.validateFields();//valide填进去的东西是否符合要求
        } catch (error) {
            return;
        }
//如果没有出错
        this.setState({
            loading: true,
        });
      //login做完之后，要通知parent
        try {
            const { asHost } = this.state;

            const resp = await login(formInstance.getFieldsValue(true), asHost);
    
            this.props.handleLoginSuccess(resp.token, asHost);//handleLoginSuccess这是父主见给的方法，通过他给父亲报信，我登陆成功了
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false,
            });
        }
    };

    handleRegister = async () => {
        const formInstance = this.formRef.current;

        try {
            await formInstance.validateFields();
        } catch (error) {
            return;
        }

        this.setState({
            loading: true,
        });

        try {
            await register(formInstance.getFieldsValue(true), this.state.asHost);
            message.success("Register Successfully");
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false,
            });
        }
    };

    handleCheckboxOnChange = (e) => {
        this.setState({
            asHost: e.target.checked,
        });
    };
//Form的onFinish，会在form提交之后被触发
    render() {
        return (
            <div style={{ width: 500, margin: "20px auto" }}>
                <Form ref={this.formRef} onFinish={this.onFinish}>
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Username!",
                            },
                        ]}
                    >
                        <Input
                            disabled={this.state.loading}
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Username"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Password!",
                            },
                        ]}
                    >
                        <Input.Password
                            disabled={this.state.loading}
                            placeholder="Password"
                        />
                    </Form.Item>
                </Form>

                <Space>
                    <Checkbox
                        disabled={this.state.loading}
                        checked={this.state.asHost}
                        onChange={this.handleCheckboxOnChange}
                    >
                        As Host
                    </Checkbox>
                    <Button
                        onClick={this.handleLogin}
                        disabled={this.state.loading}//loding的时候button会被disable
                        shape="round"
                        type="primary"
                    >
                        Log in
                    </Button>
                    <Button
                        onClick={this.handleRegister}
                        disabled={this.state.loading}
                        shape="round"
                        type="primary"
                    >
                        Register
                    </Button>
                </Space>
            </div>
        );
    }
}
//{/*//space是给一排或者一列button均匀加spacing的*/}
//                     {//这一排有两个button， 一个checkbox}
//Form是登陆表格

export default LoginPage;
