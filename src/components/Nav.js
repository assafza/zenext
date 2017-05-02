import React, {Component} from 'react';
import settings from '../assets/settings.png';
import exit from '../assets/exit.png';
import logo from '../assets/logo.png';
import '../App.css';

class Nav extends Component {

    render() {
        return (
            <div className="row">
                <div className="col-md-12 navbar">
                    <table width="100%">
                        <tr>
                            <td className="align-left"><img src={logo} className="App-logo" alt="logo"/></td>
                            <td className="align-right">
                                <a href=""><img src={settings} className="settings-logo" alt="settings" /*onClick={}*//></a>&nbsp;&nbsp;&nbsp;
                                <a href=""><img src={exit} className="exit-logo" alt="Sign out" onClick={this.props.logout}/></a>
                            </td>
                        </tr>
                    </table>
                </div>
                <hr/>        
            </div>
        );
    }
}

export default Nav;