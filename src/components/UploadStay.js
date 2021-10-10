import React from "react";
import { Form, Input, InputNumber, Button, message } from "antd";
import { uploadStay } from "../utils";

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

class UploadStay extends React.Component {
    state = {
        loading: false,
    };

    fileInputRef = React.createRef(); //ref是独立于render生命周期的global变量

    handleSubmit = async (values) => {//antd的源代码帮你传了values， values包含了form你填写的数据，我们只需要当他是个黑箱子用即可
        const formData = new FormData(); //后端传来的data是formdata格式的
        const { files } = this.fileInputRef.current;

        if (files.length > 5) {
            message.error("You can at most upload 5 pictures.");
            return;
        }

        for (let i = 0; i < files.length; i++) {//把files一个个的放到formData中
            formData.append("images", files[i]);
        }

        formData.append("name", values.name);
        formData.append("address", values.address);
        formData.append("description", values.description);
        formData.append("guest_number", values.guest_number);

        this.setState({
            loading: true,
        });
        try {
            await uploadStay(formData);
            message.success("upload successfully");
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false,
            });
        }
    };
//Form来收集data
    render() {
        return (
            <Form
                {...layout}//把layout这个obj，展开来 一个个key-value全部传过来 {labelCol = { span: 8 }, wrapperCol ={ span: 16 }}
                name="nest-messages"
                onFinish={this.handleSubmit} //onFinish是antd的全家桶按钮， 他对应一个handleSubmit函数来处理他
                style={{ maxWidth: 1000, margin: "auto" }}
            >
                {/*Form中每一条儿输入框都要一个Form.Item    required:true 是必须要填的  name是obj的名字，label是在UI上显示的字样*/}

                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true }]}
                >
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                </Form.Item>
                <Form.Item
                    name="guest_number"
                    label="Guest Number"
                    rules={[{ required: true, type: "number", min: 1 }]}
                >
                    <InputNumber />
                </Form.Item>

                <Form.Item name="picture" label="Picture" rules={[{ required: true }]}>
                    <input
                        //input是web自带的
                        type="file" //类型是个上传框
                        accept="image/png, image/jpeg"//点开上传button以后，会过滤掉除了png，jpeg以外的其他类型
                        ref={this.fileInputRef}//React把这个web自带的input包成一个obj，ref就是找到这个obj的reference : ref是出水口，this.fileInputRef是接水桶
                        multiple={true}
                    />
                </Form.Item>
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                    <Button type="primary" htmlType="submit" loading={this.state.loading}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default UploadStay;
