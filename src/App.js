import React, { Component } from 'react';
import logo from './logo.png';
import preloader from './preloader.gif';
import axios from 'axios';
import Tickets from './Tickets';
import './App.css';

class App extends Component {

  constructor(props) {
      super(props);
      this.state = {
          ticketsArr: [],
          newTickets: 0,
          zendeskDomain:"",
          //1-online, 2-offline, 3-unauthorized, 4-loading
          userStatus:2
      };
  }


  componentWillMount = () => {

    window.chrome.storage.local.get((cb) => {
      console.log(cb);
      if(cb.zendeskDomain){
        this.setState({
          ticketsArr: cb.ticketsArr,
          newTickets: cb.newTickets,
          userStatus:1
          })
       window.chrome.browserAction.setBadgeText({text:String(cb.ticketsArr.length )});

      }
      else{
        console.log("logged out");
      }
    });
  }

  handleSignIn = (e) => {
    console.log("sign in")
    e.preventDefault();
    console.log("domain:" , this.state.zendeskDomain)
    axios.get('https://'+this.state.zendeskDomain+'.zendesk.com/api/v2/search.json?query=type:ticket%20status:open%20status:new')
      .then( (response) => {
        console.log(response);
        //update the state
        this.setState({
          userStatus:4
        });
        setTimeout(() =>  {
          //update the state
          this.setState({
            ticketsArr: response.data.results,
            newTickets: response.data.count,
            userStatus:1
          });
        }, 3000);

        //update the badge counter
        window.chrome.browserAction.setBadgeText({text:String(response.data.count )});
      //  update the local storage
        window.chrome.storage.local.set(
          {
            ticketsArr: this.state.ticketsArr,
            newTickets: this.state.newTickets,
            zendeskDomain:this.state.zendeskDomain
          }
        );
    })
      .catch( (error) => {
        console.log(error);
        this.setState({
           userStatus:3
        })
      });
  }

  handleInput = (e) => {
    console.log("print")
    this.setState({
      zendeskDomain: e.target.value
    })
  }

  logout = () => {
    window.chrome.storage.local.clear();
    window.chrome.browserAction.setBadgeText({text:"0"});
    this.setState({
        userStatus:2
    })
  }

  settings = () => {

  }



  render() {
    //check user is logged in
    if(this.state.userStatus == 1){
      return (
        <div className="container">
          <div className="row">

            <div className="col-md-12 navbar">
              <img src={logo} className="App-logo" alt="logo" />
            </div>

              <hr/>
          <Tickets newTickets={this.state.newTickets} tickets={this.state.ticketsArr}/>
          </div>
        </div>

          )

    }
     if (this.state.userStatus == 2){
      return (

          <div className="container">
            <div className="row">
              <div className="col-md-12 navbar">
                <img src={logo} className="App-logo" alt="logo" />
              </div>
              <hr/>
              <h3 className="title">Hello There Agent</h3>
              <p className="intro">
                  Please sign in with your Zendesk account
                  to start getting real time notification
                  on new tickets
              </p>

            </div>
            <div className="row">
              <div className="col-md-12 input">
                <input type ="text" className="inputDomain" onChange={this.handleInput} key placeholder=" Domain Name"></input><span className="intro">.zendesk.com</span>
              </div>
            </div>
            <br/>

            <div className="row">
              <div className="col-md-12 submit">
                <button className="myButton" onClick={this.handleSignIn}> Sign In</button>
              </div>
            </div>
            <br/>
            <hr/>

          </div>
      );
    }
    if (this.state.userStatus == 3){
      return(
        <div >oops seems like you have problem logging in,
          please check your zendesk account is logged in and then try again</div>
      )
    }
    if (this.state.userStatus == 4){
      return(
        <div className="preloader" >
          <img src={preloader} />
          <div>LOADING YOUR ZENDESK ACCOUNT</div>
        </div>

      )
    }

  }
}



export default App;
