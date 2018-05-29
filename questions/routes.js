'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const Question = require('./models');
const LinkedList = require('../linkedList/linkedList');
const User = require('../users/models');
const {simple}= require('../linkedList/questionList');

// get one question from mLab to test endpoint
// get one question *needs to be specific for user depending on where user left off*
// user.findOne({username}) where {username} = req.user
router.get('/questions', (req, res, next) => {

  // if quesHead and quesNext are empty then populate
  const {username} = req.user;

  User.findOne({username})
    .then(user => {
      if (!user.questionsObj.questionHead) {
        user.questionsObj.questionHead = user.userQuestionList[0];
        user.questionsObj.questionNext = user.userQuestionList[1];
        console.log('this is firstQues', user.questionsObj.questionHead);
        return res.json(user.questionsObj);
      }
      else{
        return res.json(user.questionsObj);
      }
    })
    .catch(err => {
      next(err);
    });

});

// post endpoint for when users enter in an answer
// 1. need to check userAnswer with answer stored in db 
// -> give message and correct answer if wrong -> give message 'Correct' if right 
// 2. implement algo so depending on if user got question right or wrong, put it back in list
// 3. change user score 

// update correct and incorrect for user
// switching questions


router.post('/questions', (req, res, next) => {
  console.log('req.bod=====', req.body);
  const { userAnswer } = req.body;
  const {username} = req.user;
  const newList = new LinkedList();
  const newQuestionArray=[];

  User.findOne({username})
    .then(user => {
      console.log('firssttt', user);
      user.userQuestionList.map(question=>{
        newList.insertLast(question);
      });
      // console.log(newList);
      simple(newList);
      // console.log('after simple', newList);

      let currentNode=newList.head;
      while(currentNode!==null){
        newQuestionArray.push(currentNode.value);
        currentNode= currentNode.next;
      }
      // console.log(newQuestionArray);

      user.userQuestionList=newQuestionArray;
      console.log(user.userQuestionList);

      User.updateOne({username}, {$set: {userQuestionList: user.userQuestionList}})
        .then(result => {
          console.log('updating list');
        });
      user.questionsObj.questionHead = user.userQuestionList[0];
      user.questionsObj.questionNext = user.userQuestionList[1];

      console.log('finaallll', user.questionsObj);
      return res.json(user.questionsObj);
    })
    .catch(err => {
      next(err);
    });

  //TODO:
  // const {correct, incorrect} = req.body
  // if(user.questionObj.correct !== correct){
  //   //means incorrect, please change order of linkedlist/array to work
  //algorithm B that changes so incorrect question appears earlier
  //put post in here and just change simple to algorithm b
  // }
  // else if (correct===user.user.questionObj.correct){
  //   //means correct, keep going in order
  // algorithm A where things progress at the correct pace
  //put post in here and just change simple to algorithm a

// }
  
});


module.exports = router;