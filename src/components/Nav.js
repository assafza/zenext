import React, {Component} from 'react';
import mute from '../assets/alarm.png';
import muted from '../assets/alarmno.png'
import exit from '../assets/power.png';
import settings from '../assets/settings.png';
import logo from '../assets/logoNEW.png';
import DropDown from './dropDown'
import '../App.css';
//icons color #d8d8d8
class Nav extends Component {

  constructor(props) {
      super(props);
        this.state = {notificationSetting: true}
    }
    //setting the state to be aligned with the local storage on notification settings
    componentDidMount = () => {
      window.chrome.storage.local.get((storage) => {
        if (storage.zendeskDomain){
          this.setState({notificationSetting: storage.notificationSetting})
        }
      })
    }

     //toggle chrome desktop notifications
    toggleNotifications = () => {
      window.chrome.storage.local.set({
                notificationSetting: !this.state.notificationSetting
            });
      this.setState({notificationSetting: !this.state.notificationSetting});
    }

    render() {
      let buttons;
      console.log("notification" , this.state.notificationSetting)
        if (this.props.hasButtons){
          buttons= (<td className="align-right">
                      <DropDown changeView={this.props.changeView} viewsArr={this.props.viewsArr} defaultViewID={this.props.defaultViewID} defaultViewTitle={this.props.defaultViewTitle} />
                      <img src={(this.state.notificationSetting) ? mute : muted} className="settings-logo" title={(this.state.notificationSetting) ? "Mute notifications" : "Unmute notifications"} onClick={this.toggleNotifications}/>
                      <img src={exit} className="exit-logo" alt="Sign out" title="Logout" onClick={this.props.logout}/>
                    </td>)
                  }
        return (
            <div className="row">
                <div className="col-md-12 topNavbar navbar">
                    <table width="100%">
                        <tr>
                            <td className="align-left"><img src={logo} className="App-logo" alt="logo"/></td>
                            {buttons}
                        </tr>
                    </table>
                </div>
                <hr/>
            </div>
        );
    }
}

export default Nav;
