import React, {Component} from 'react';
import axios from 'axios'
import Joke from './Joke';
import uuid from 'uuid/v4';
import './Jokes.css';

class Jokes extends Component{
    static defaultProps = {
        numJokesToGet: 10
    }
    constructor(props){
        super(props);
        this.state = {jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'), loading: false}
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        console.log(this.seenJokes)
        this.handleClick = this.handleClick.bind(this)
    }
    
    componentDidMount(){
        if(this.state.jokes.length === 0) this.getJokes()
    }

    async getJokes(){
        try{
            const proxyurl = "https://cors-anywhere.herokuapp.com/"
            let jokes = [];
            while(jokes.length < this.props.numJokesToGet){
                let res = await axios.get(`${proxyurl}https://icanhazdadjoke.com/`, {headers: {Accept: 'application/json'}});
                let newJoke = res.data.joke;
                if(!this.seenJokes.has(newJoke)){
                    jokes.push({id: uuid(), text: res.data.joke, votes: 0})
                    this.seenJokes.add(newJoke.id)
                } else {
                    console.log('Found A Duplicate!')
                    console.log(newJoke)
                }
            }

            this.setState(st =>({
                loading: false,
                jokes: [...st.jokes, ...jokes]
            }),
                () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
            );
      } catch(err){
        alert(err)
        this.setState({loading: false});
      }
    }
    
    handleClick(){
       this.setState({loading: true}, this.getJokes)
    }

    handleVote(id, delta){
      this.setState(st =>({
          jokes: st.jokes.map(j =>
            j.id === id ? {...j, votes: j.votes + delta} : j
          )
      }), 
       () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
      );
    }

    render(){
        if(this.state.loading){
            return(
                <div className='Jokes-spinner'>
                    <i className='far fa-8x fa-laugh fa-spin'/>
                    <h1 className='Jokes-title'>Loading...</h1>
                </div>
            )
        }
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes)
        return(
            <div className='Jokes'>
                <div className='Jokes-sidebar'>
                    <h1 className='Jokes-title'><span>Dad</span> Jokes</h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'/>
                    <button onClick={this.handleClick} className='Jokes-getmore'>Fetch Jokes</button>
                </div>
                
                <div className='Joke-list'>
                   {jokes.map(j => 
                     <Joke 
                        key={j.id} 
                        votes={j.votes} 
                        text={j.text}
                        upvote={() => this.handleVote(j.id, 1)}
                        downvote={() => this.handleVote(j.id, -1)}
                    />)}
                </div>
            </div>
        )
    }
}

export default Jokes;