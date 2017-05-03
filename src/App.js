import React, {Component} from 'react';
import preloader from './assets/preloader.gif';
import Toggle from 'react-toggle'
import ReactTooltip from 'react-tooltip'
import axios from 'axios';
import Tickets from './components/Tickets';
import Nav from './components/Nav';
import NoButtonNav from './components/NoButtonNav';
import LoginForm from './components/LoginForm';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);
        //set initial state
        this.state = {
            ticketsArr: [],
            newTickets: 0,
            zendeskDomain: "",
            //1-online, 2-offline, 3-unauthorized, 4-loading
            userStatus: 2
        }
        //listener for changes in local storage tickets from bg calls
        window.chrome.storage.onChanged.addListener((NewStore) => {
            console.log("changes in local storage" , NewStore)
            if (NewStore.ticketsArr.newValue){
              this.setState({
                ticketsArr:NewStore.ticketsArr.newValue ,
                newTickets:NewStore.ticketsArr.newValue.length
              })
            }
        });
    }

    componentWillMount = () => {
        window.chrome.storage.local.get((cb) => {
            if (cb.zendeskDomain && cb.defaultViewID) {
                this.setState(
                  {
                    ticketsArr: cb.ticketsArr,
                    newTickets: cb.newTickets,
                    userStatus: 1,
                    zendeskDomain:cb.zendeskDomain,
                    defaultViewID:cb.defaultViewID,
                  })
            }
        })
    }

    //making an API call and creating the view list array
    createViewList = (domain) => {
      //set up the views list in local storage
      axios.get('https://'+domain+'.zendesk.com/api/v2/views/compact')
      .then((response) => {
          console.log("api view list" ,response);
          this.setState(
            {
              viewListArr: response.data.views,
              defaultViewID:response.data.views[0].id
            })
            //set the local storage with the default view id
            window.chrome.storage.local.set({
              defaultViewID:response.data.views[0].id,
              viewListArr:response.data.views
            });
            this.createTicketList(response.data.views[0].id);
      }).catch((error) => {
          console.log(error);
          this.setState({userStatus: 3})
      });
    }

    //making an API call and creating the ticket list array
    createTicketList = (defaultViewID) => {
      axios.get('https://'+this.state.zendeskDomain+'.zendesk.com/api/v2/views/'+defaultViewID+'/execute.json?per_page=60&page=1&sort_by=id&sort_order=desc&group_by=+&include=via_id')
      .then((response) => {
          //set the user's state to loading
          this.setState({userStatus: 4});
          setTimeout(() => {
              //after a 'loading period' set user to online
              this.setState(
                {
                ticketsArr: response.data.rows,
                newTickets: response.data.count,
                userStatus: 1
                });
          }, 4000);
          //if ticket count is 0, empty badge
          if(response.data.count == 0){
               window.chrome.browserAction.setBadgeText({
                    text: ''
                });
            }else {
            //otherwise change badge to reflect ticket #
                window.chrome.browserAction.setBadgeText({
                    text: String(response.data.count)
                });
            }
          //  update the local storage
          window.chrome.storage.local.set({
            ticketsArr: this.state.ticketsArr,
            newTickets: this.state.newTickets,
            zendeskDomain: this.state.zendeskDomain,
            notificationSetting:true
          });
      })
      .catch((error) => {
          console.log(error);
      });
    }

    //function for detecting open zendesk tab
    detectTab = (input) => {
        var that = this;
        window.chrome.tabs.getAllInWindow(null, function(cb){
            let re = /zendesk\.com\/agent\/filters\//
            let result = cb.filter(function ( obj ) {
                return obj.url.match(re);
            })[0];
    //and retrieving viewid and domain
            if(result){
                let reViewId = /\w+$/;
                let viewID= result.url.match(reViewId)[0];
                if(viewID){
                    let splitting = result.url.split("/")[2];
                    let domain = splitting.split(".")[0];
    //then sends domain info to input/state for login
                    input.value = domain;
                    that.setState({zendeskDomain: domain});
                }
            }
        });
    }

    handleSignIn = (e) => {
      e.preventDefault();
      console.log(this.state);
      this.createViewList(this.state.zendeskDomain);
    }

    handleInput = (e) => {
        this.setState({zendeskDomain: e.target.value})
    }

    //function for logging out
    //clear all storage and change user status
    logout = () => {
        window.chrome.storage.local.clear();
        window.chrome.browserAction.setBadgeText({text: ''});
        this.setState({userStatus: 2})
    }

    settings = () => {}

    //updating the default view for the user
    updateDefaultView = (viewID) => {

    }

    //switch zendesk domain
    changeDomain = (domain) => {

    }


    //render function for user online status
    renderOnline() {
        return (
            <div className="onlinePage">
                <Tickets newTickets={this.state.newTickets} tickets={this.state.ticketsArr} domain={this.state.zendeskDomain}/>
            </div>
        )
    }

    //render function for user offline status
    renderOffline(){
        return (
                <LoginForm detectTab={this.detectTab} handleInput={this.handleInput} handleSignIn={this.handleSignIn} userStatus={this.state.userStatus}/>
        )
    }

    //render function for user unauthorized status
    renderUnauthorized() {
        return (
                <div >There was a problem logging in, please check your zendesk account is logged in and then try again
                </div>
        )
    }

    //render function for user loading status
    renderLoading(){
        return (
                <div className="preloader">
                <img className="preloaderImg" src={preloader}/>
                    <div className="preloaderText">
                    LOADING YOUR ZENDESK ACCOUNT
                    </div>
                </div>
        )
    }

    render() {
      let hasButtons;
      let content;
      content= this.renderUnauthorized()
        //main render- according to user status
        if (this.state.userStatus == 1) {
            content = this.renderOnline()
            hasButtons = true;
        } else if (this.state.userStatus == 2) {
            content =  this.renderOffline()
        } else if (this.state.userStatus == 3) {
            content= this.renderUnauthorized()
        } else if (this.state.userStatus == 4) {
            content= this.renderLoading()
        }
        return(
          <div className="container">
              <Nav logout={this.logout} hasButtons={hasButtons}/>
                {content}
          </div>
        )

    }
}

export default App;
