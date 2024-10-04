import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import KeyboardArrowRightIcon  from '@mui/icons-material/KeyboardArrowRight';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Add from '@mui/icons-material/Add';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Input from '@mui/joy/Input';
import Alert from '@mui/material/Alert';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import './index.css';

const Calculator = () => {
  const [expenseInput, setExpenseInput] = useState({
    expense: '',
    cost: '',
    friends: [],
  });
  const [friendsInput, setFriendsInput] = useState('');
  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [commonCosts, setCommonCosts] = useState({
    CGST: '',
    SGST: '',
    totalTax: '',
    serviceFee: '',
    tips: '',
  });
  const [discount, setDiscount] = useState({
    discountAmount: '',
    discountPercent: '',
  });
  const [totalExpense, setTotalExpense] = useState(0);
  const [result, setResult] = useState(new Map());
  const [isErrorOccurred, setIsErrorOccurred] = useState(false);

  function convertStringNumbersToInt(obj) {
    const newObj = {...obj}
    for (let key in obj) {
        if (!isNaN(obj[key]) && typeof obj[key] !== 'object' && obj[key] !== '') 
          newObj[key] = parseFloat(obj[key]);
        else if (obj[key] === '') 
          newObj[key] = 0;
    }
    newObj.expenses.forEach((expense) => expense.cost = parseFloat(expense.cost));
    return newObj;
  }
  
  const calculateExpenseAmount = (input) => {
    let totalCost = 0;
    input.expenses.forEach((expense) => totalCost = totalCost + expense.cost);
    return totalCost;
  };
    
  const checkEqual = (input) => {
    const fullAmount = input.totalTax + input.CGST + input.SGST + input.serviceFee + input.tips + calculateExpenseAmount(input) - input.discountAmount;
    const finalAmount = fullAmount - (fullAmount * input.discountPercent) / 100;
    return Math.floor(finalAmount) === Math.floor(input.totalExpense);
  };
  

  const handleCalculate = () => {
    const stringInput = {
      expenses,
      ...commonCosts,
      ...discount,
      totalExpense,
      friends,
    };

    const input = convertStringNumbersToInt(stringInput);
    
    if(checkEqual(input)) {
      const friendsMap = new Map();
      let commonCosts = input.totalTax + input.CGST + input.SGST + input.serviceFee + input.tips - input.discountAmount;
      const fullAmount = commonCosts + calculateExpenseAmount(input);
      commonCosts = commonCosts - (fullAmount * input.discountPercent) / 100;
      const commonCost = commonCosts / input.friends.length;
      input.friends.forEach((friend) => friendsMap.set(friend, 0));
      input.expenses.forEach((expense) => {
        const individualCost = expense.cost / expense.friends.length;
        expense.friends.forEach((friend) => {
          friendsMap.set(friend, friendsMap.get(friend) + individualCost);
        });
      });
      friendsMap.forEach((cost,friend) => {
        friendsMap.set(friend, (cost + commonCost).toFixed(2))
      });
      setResult(friendsMap);
      setIsErrorOccurred(false);
    } else {
      setIsErrorOccurred(true);
    }
  }

  const addFriend = (e) => {
    e.preventDefault();
    if (friendsInput.trim() !== '') {
      setFriends([...friends, friendsInput]);
      setFriendsInput('');
    };  
  };

  const removeFriend = (index) => {
    const updatedFriends = friends.filter((val, friendIndex) => friendIndex != index);
    setFriends(updatedFriends);
  }

  const removeExpense = (index) => {
    const updatedExpenses = expenses.filter((val, expenseIndex) => expenseIndex != index);
    setExpenses(updatedExpenses);
  }

  const addExpense = () => {
    if (expenseInput.expense.trim() !== '' && expenseInput.cost !== '' && expenseInput.friends.length !== 0) {
      setExpenses([...expenses, expenseInput]);
      setExpenseInput({
        expense: '',
        cost: '',
        friends: [],
      });
    };  
  };

  const handleFriendSelect = (event, friendList) => {
    setExpenseInput({...expenseInput, friends: friendList});
  };

  return (
    <div className="main">
      <h1>ShareFare</h1>
      
      <div className="total-expense">
      <Input
          startDecorator={'₹'}
          placeholder="0.00"
          value={totalExpense}
          onChange={(e) => setTotalExpense(e.target.value)}
          sx={{ width: 375 }}
          size="lg"
        />
      </div>
      <br />

      <div className="friends">
        <form className="friends-input" onSubmit={(e) => addFriend(e)}>
          <Input
            value={friendsInput}
            onChange={(e) => setFriendsInput(e.target.value)}
            placeholder="Add Friend"
            sx={{ width: 375 }}
          />
          <br />
          <IconButton
            variant="solid"
            type="submit"
            style={{ margin: '0 0.5rem ' }}
            color='primary'>
            <PersonAddIcon />
          </IconButton>
        </form>
        <ul>
          {friends.map((friend, index) => (
            <div>
              <li className='friends-list' key={index}>
                <span className='friends-list-name'>{friend}</span>
                <HighlightOffIcon onClick={() => removeFriend(index)} className='delete-button float-button' fontSize="small"/>
              </li>
            </div>
          ))}
        </ul>
      </div>

      <div className="expenses">
        <h2>Expenses</h2>
        <h4>Add item and its corresponding cost</h4>
          <Input
            placeholder="Expense"
            value={expenseInput.expense}
            onChange={(e) => setExpenseInput(({...expenseInput, expense: e.target.value}))}
            sx={{ width: 375 }}
          />
          <br />
          <Input
            placeholder="Cost"
            startDecorator={'₹'}
            value={expenseInput.cost}
            onChange={(e) => setExpenseInput(({...expenseInput, cost: e.target.value}))}
            sx={{ width: 375 }}
          />
          <br />

          {friends.length !== 0 ?
            <Select onChange={handleFriendSelect} placeholder="Select Friend" multiple sx={{ width: 375 }}>
              {friends.map((friend) => (
                <Option key={friend} value={friend}>{friend}</Option>
              ))}
            </Select> : <Select placeholder="Select friends" disabled sx={{ width: 375 }} />
          }
          <br />
          <Button
            onClick={addExpense} 
            variant="solid"
            startDecorator={<Add/>}>
            ADD EXPENSE
          </Button>
        <ul>
          {expenses.map((expense, index) => (
            <li className="expenses-list" key={index}><span className="expenses-list-name">{expense.expense}  -  Rs. {expense.cost}  -  {expense.friends.join(", ")}</span><HighlightOffIcon onClick={() => removeExpense(index)} className='delete-button' fontSize="small"/></li>
          ))}
        </ul>
      </div>

      <div className="common-costs">
        <h2>Common Costs (if any)</h2>
        <div className="tax-input">
          {(isEmpty(commonCosts.CGST) && isEmpty(commonCosts.SGST)) ? <Input
            placeholder="Total Tax"
            value={commonCosts.totalTax}
            onChange={(e) => setCommonCosts(({...commonCosts, totalTax: e.target.value}))}
            sx={{ width: 375 }}
          /> : <Input placeholder="Total Tax" sx={{ width: 375 }} disabled />}
          <span style={{ margin: '0.5rem 1rem ' }}> OR </span>
          {isEmpty(commonCosts.totalTax) ? (<>
          <Input
            placeholder="CGST"
            value={commonCosts.CGST}
            onChange={(e) => setCommonCosts(({...commonCosts, CGST: e.target.value}))}
            sx={{ width: 200 }}
          />
          <Input
            placeholder="SGST"
            value={commonCosts.SGST}
            style={{ margin: '0 0.5rem ' }}
            onChange={(e) => setCommonCosts(({...commonCosts, SGST: e.target.value}))}
            sx={{ width: 200 }}
          />
          </>) : 
          (<>
          <Input
            placeholder="CGST"
            sx={{ width: 200 }}
            disabled
          />
          <Input
            placeholder="SGST"
            style={{ margin: '0 0.5rem ' }}
            sx={{ width: 200 }}
            disabled
          />
          </>)}
        </div>
        <br /><br />
        <Input
          placeholder="Service Fee"
          value={commonCosts.serviceFee}
          onChange={(e) => setCommonCosts(({...commonCosts, serviceFee: e.target.value}))}
          sx={{ width: 375 }}
        />
        <br />
        <Input
          placeholder="Tips"
          value={commonCosts.tips}
          onChange={(e) => setCommonCosts(({...commonCosts, tips: e.target.value}))}
          sx={{ width: 375 }}
        />
      </div>

      <div className="offers">
        <h2>Apply Offer Discount (if any)</h2>
        <div className="discount-input">
          {isEmpty(discount.discountPercent) ? <Input
            placeholder="Discount amount"
            value={discount.discountAmount}
            startDecorator={'₹'}
            onChange={(e) => setDiscount({...discount, discountAmount: e.target.value})}
            sx={{ width: 256 }}
          /> : <Input placeholder="Discount amount" startDecorator={'₹'} sx={{ width: 256 }} disabled />}
          <span style={{ margin: '0.5rem 1rem ' }}> OR </span>
          {isEmpty(discount.discountAmount) ? <Input
            type="float"
            placeholder="Discount %"
            value={discount.discountPercent}
            endDecorator={'%'}
            onChange={(e) => setDiscount({...discount, discountPercent: e.target.value})}
            sx={{ width: 256 }}
          /> : <Input placeholder="Discount %" endDecorator={'%'} sx={{ width: 256 }} disabled />}
        </div>
      </div>
      <br />

      <Button 
        onClick={handleCalculate} 
        variant="solid"
        endDecorator={<KeyboardArrowRightIcon  />}>
        CALCULATE
      </Button>
      {!isErrorOccurred ? 
        <ul>
          {Array.from(result).map(([name, value]) => (
            <li key={name}>{name} - {value}</li>
          ))}
        </ul> 
        :
        <div className='error-alert'>
          <Alert severity="error">Total cost is not adding up to expenses!</Alert>
        </div>
      }
    </div>
  );
}

export default Calculator;
