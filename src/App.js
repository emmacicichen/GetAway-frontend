import { Layout, Dropdown, Menu, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import React from "react";
import LoginPage from "./components/LoginPage";
import HostHomePage from "./components/HostHomePage";
import GuestHomePage from "./components/GuestHomePage";


const { Header, Content } = Layout;//destructure
//const Header = Layout.Header

class App extends React.Component {
  state = {//用户是否登陆了//要把这个state放到顶层的App.js 因为全局都要用它，可以作为props向下传
    authed: false,
    asHost: false,
  };

  componentDidMount() {//第一次render之后，（有东西到页面之后）立刻执行componentDidMount
    const authToken = localStorage.getItem("authToken");//localStorage有点像cookie。 HTTP only = true， 因此js就不能访问cookie
    const asHost = localStorage.getItem("asHost") === "true";//因此，login persistence->登陆之后关掉浏览器，还能记住login信息-》localStorage
    //1。 localStorage不会被清空 （不论关掉，更新） 2。存储空间很大 3。 存key-value pair
    //当过了很多天，先要判断token是否过期，1。 如果没过期，直接page 2。 若过期，给一个login page
    //不能用state来存登陆状态，因为每次刷新 state就变了
    this.setState({
      authed: authToken !== null,
      asHost,
    });
  }

  handleLoginSuccess = (token, asHost) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("asHost", asHost);
    this.setState({
      authed: true,
      asHost,
    });
  };

  handleLogOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("asHost");
    this.setState({
      authed: false,
    });
  };

  renderContent = () => {
      if (!this.state.authed) {
          return <LoginPage handleLoginSuccess={this.handleLoginSuccess} />;
      }
      //if you are host, give the host home page
      if (this.state.asHost) {
          return <HostHomePage />;
      }

//if you are guest, give the guest home page
    return <GuestHomePage />;
  };

  userMenu = (
      <Menu>
        <Menu.Item key="logout" onClick={this.handleLogOut}>
          Log Out
        </Menu.Item>
      </Menu>
  );

  render() {
    return (
        <Layout style={{ height: "100vh" }}>
          <Header style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "white" }}>
              Stays Booking
            </div>
            {this.state.authed && (
                <div>
                  <Dropdown trigger="click" overlay={this.userMenu}>
                    <Button icon={<UserOutlined />} shape="circle" />
                  </Dropdown>
                </div>
            )}
          </Header>
          <Content
              style={{ height: "calc(100% - 64px)", margin: 20, overflow: "auto" }}
          >
            {this.renderContent() }

          </Content>
        </Layout>
    );
  }
}

export default App;
