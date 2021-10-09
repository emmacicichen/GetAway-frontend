import React from "react";
import {Tabs, List, Carousel, Image, Card, message, Button, Tooltip, Space} from "antd";
import {LeftCircleFilled, RightCircleFilled, InfoCircleOutlined,} from "@ant-design/icons";
import Text from "antd/es/typography/Text";
import { deleteStay, getReservationsByStay, getStaysByHost } from "../utils";

import Modal from "antd/es/modal/Modal";
const { TabPane } = Tabs;
//import UploadStay from "./UploadStay";

//一个js file是一个module， （相当于一个java 的class），他里面可以有多个component的class
//HostHomePage 页面上有很多个页面：Mystay，upload stay
class HostHomePage extends React.Component {
    render() {
        return (
            <Tabs defaultActiveKey="1" destroyInactiveTabPane={true}>
                <TabPane tab="My Stays" key="1">
                    <MyStays />
                </TabPane>
                <TabPane tab="Upload Stay" key="2">
                    <div>Upload Stays</div>
                </TabPane>
            </Tabs>
        );
    }
}

//后端那数据的是json array -》 卡片集合，每一个stay就做成一个小卡片，长一点儿的内容 可以放在tootip里，更多内容可以放右上角的more中
class MyStays extends React.Component {
    state = {
        loading: false,
        data: [],
    };
//当component一上树，就要载入数据，//第一次render之后，就会调用didmount
    componentDidMount() {
        this.loadData();
    }

    loadData = async () => {
        //step1： set loading to true
        //indication的显示，向后端要数据的过程中，我来一个旋转的loading，让用户知道
        this.setState({
            loading: true,
        });
        //step2: fetch data from backend
        try {
            const resp = await getStaysByHost();
            this.setState({
                data: resp,
            });
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false,
            });
        }
    };

    render() {
        return (
            //Responsive grid list from antd
            <List
                loading={this.state.loading}
                grid={{//第一层{}说明中间不是string，第二层包的是个obj
                    gutter: 16,
                    xs: 1,//xs是多大的屏幕，1是一行放几个图片
                    sm: 3,
                    md: 3,
                    lg: 3,
                    xl: 4,
                    xxl: 4,
                }}
                dataSource={this.state.data}
                renderItem={(item) => (//吃进去一个卡片，吐出来一张 把一个data转化成jsx
                    <List.Item>
                        <Card
                            key={item.id}
                            title={
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Text ellipsis={true} style={{ maxWidth: 150 }}>
                                        {item.name}
                                    </Text>
                                    <StayDetailInfoButton stay={item} />
                                </div>
                                /*把text和button都放入flex box，得以用居中功能*/
                            }
                            actions={[<ViewReservationsButton stay={item}/>]}
                            extra={<RemoveStayButton stay={item} onRemoveSuccess={() => this.loadData()} />}//给这个delete button单独搞一个component，decouple出来，让她自己有自己的state
                        >
                            {//每个card里的内容
                                <Carousel
                                    //Carousel： 多张图片左右滑动功能
                                    dots={false}
                                    arrows={true}
                                    prevArrow={<LeftCircleFilled />}
                                    nextArrow={<RightCircleFilled />}
                                >
                                    {item.images.map((image, index) => (
                                        <div key={index}>
                                            <Image src={image.url} width="100%" />
                                        </div>
                                    ))}
                                </Carousel>
                            }
                        </Card>
                    </List.Item>
                )}
            />
        );
    }
}

export class StayDetailInfoButton extends React.Component {
    state = {
        modalVisible: false,
    };

    openModal = () => {
        this.setState({
            modalVisible: true,
        });
    };

    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    };

    render() {
        const { stay } = this.props;
        const { name, description, address, guest_number } = stay;
        const { modalVisible } = this.state;
        return (
            <>
                {/*{//Fragments look like empty JSX tags. They let you group a list of children without adding extra nodes (wrap them in a <div>)to the DOM:}*/}
                <Tooltip title="View Stay Details">
                    <Button
                        onClick={this.openModal}
                        style={{ border: "none" }}// The outer curly braces tell the JSX parser that the syntax should be interpreted as javascript. The inner braces are used because the style variable accepts an object.
                        size="large"
                        icon={<InfoCircleOutlined />}
                    />
                </Tooltip>
                {modalVisible && ( //modal就是点开的小窗口
                    <Modal
                        title={name}
                        centered={true}
                        visible={modalVisible}
                        closable={false}
                        footer={null}
                        onCancel={this.handleCancel}
                    >
                        <Space direction="vertical">
                            <Text strong={true}>Description</Text>
                            <Text type="secondary">{description}</Text>
                            <Text strong={true}>Address</Text>
                            <Text type="secondary">{address}</Text>
                            <Text strong={true}>Guest Number</Text>
                            <Text type="secondary">{guest_number}</Text>
                        </Space>
                    </Modal>
                )}
            </>
        );
    }
}

class RemoveStayButton extends React.Component {
    state = {
        loading: false,
    };

    handleRemoveStay = async () => {
        const { stay, onRemoveSuccess } = this.props;
        this.setState({
            loading: true,
        });

        try {
            await deleteStay(stay.id);
            onRemoveSuccess();
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false,
            });
        }

    };
    render() {
        return (
            <Button
                loading={this.state.loading}
                onClick={this.handleRemoveStay}
                danger={true}//红色的
                shape="round"
                type="primary" //有背景色红色，文字白色
            >
                Remove Stay
            </Button>
        );
    }
}

//show the customer info and reveration date
class ReservationList extends React.Component {
    state = {
        loading: false,
        reservations: [],
    };

    componentDidMount() {
        this.loadData();
    }

    loadData = async () => {
        this.setState({
            loading: true,
        });

        try {
            const resp = await getReservationsByStay(this.props.stayId);
            this.setState({
                reservations: resp,
            });
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false,
            });
        }
    };

    render() {
        const { loading, reservations } = this.state;

        return (
            <List
                loading={loading}
                dataSource={reservations}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<Text>Guest Name: {item.guest.username}</Text>}
                            description={
                                <>
                                    <Text>Checkin Date: {item.checkin_date}</Text>
                                    <br />
                                    <Text>Checkout Date: {item.checkout_date}</Text>
                                </>
                            }
                        />
                    </List.Item>
                )}
            />
        );
    }
}

class ViewReservationsButton extends React.Component {
    state = {
        modalVisible: false,
    };

    openModal = () => {
        this.setState({
            modalVisible: true,
        });
    };

    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    };

    render() {
        const { stay } = this.props;
        const { modalVisible } = this.state;

        const modalTitle = `Reservations of ${stay.name}`; //template string，在一串写死了的string中插入变量

        return (
            <>
                <Button onClick={this.openModal} shape="round">
                    View Reservations
                </Button>
                {modalVisible && (
                    <Modal //弹窗， 下面是config这个modal
                        title={modalTitle}
                        centered={true}
                        visible={modalVisible}
                        closable={false}//是否显示右上角的小X
                        footer={null}//不使用antd的footer.这样就没有那条分割线
                        onCancel={this.handleCancel}
                        destroyOnClose={true}//destroy the doms in the popup window
                    >
                        <ReservationList stayId={stay.id} />
                    </Modal>
                )}
            </>
        );
    }
}


export default HostHomePage;




/*
* <Tabs>

* <Tabs defaultActiveKey="1" onChange={callback}> //defaultActiveKey="1" default的时候亮哪个tab
    <TabPane tab="Tab 1" key="1">
      Content of Tab Pane 1
    </TabPane>
    <TabPane tab="Tab 2" key="2">
      Content of Tab Pane 2
    </TabPane>
    <TabPane tab="Tab 3" key="3">
      Content of Tab Pane 3
    </TabPane>
  </Tabs>
  *
  *
  *  <Text>给过于长的文字，隐藏起来 然后显示tooltip
  *
  *
  * destroyInactiveTabPane={true} -> 当这个tab inactivate时候要destroy他，从dom tree中拿掉了（下树）， active的时候再上树
*
* */