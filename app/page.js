'use client'
import Image from "next/image";
import React from 'react'
import {useState, useEffect} from 'react'
import {firestore} from "@/firebase"
import {Button, Typography, Box, Stack, TextField, Modal} from '@mui/material'
import { collection, getDoc, getDocs, query, setDoc, deleteDoc, doc} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchMode, setSearch] = useState(true)
  const [searched, setSearched] = useState('')
  
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach(doc => {
      const data = doc.data();
      const name = doc.id.toLowerCase();
      if (searchMode && !name.includes(searched.toLowerCase())) {
        return; // Skip this item if it does not match the search query
      }
      inventoryList.push({
        name,
        ...data,
      });
    });

    setInventory(inventoryList);
    // console.log(inventoryList)
  }

  const updateItem = async (item) =>{
    const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase())
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    } else {
      await setDoc(docRef, {quantity: 1})
    }
    await updateInventory()
  }

  const removeItem = async (item) =>{
    const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase())
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if(quantity === 1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  useEffect(()=> {
    updateInventory()
  }, [searchMode, searched])
  
  const searchClose = ()=>setSearch(false)
  const searchOpen = ()=>setSearch(true)
  const handleOpen = ()=> setOpen(true)
  const handleClose = ()=> setOpen(false)

  // const searchItem = async(item)=>{
  //   const docRef = doc(collection(firestore,'inventory'), item)
  //   const docSnap = await getDoc(docRef)
  //   if(docSnap.exists())
  // }
  return (
    <Box width= "100vw" height ="100vh" display="flex" flexDirection="column" justifyContent={'center'} alignItems={'center'} gap={2}>
      <Modal open={open} onClose={handleClose}>
        <Box position="absolute" top="50%" left="50%" sx={{transform: "translate(-50%,-50%)"}} width={400} bgcolor="white" border="2px solid #000" boxShadow={24} p={4} display="flex" flexDirection={"column"} gap={3}>
          <Typography variant = "h6">Add Item</Typography>
          <Stack width="100%" direction={'row'} gap={2}>
            <TextField fullWidth value={itemName} onChange={(e)=> { setItemName(e.target.value)}}></TextField>
            <Button variant="outlined" onClick={()=>{
              updateItem(itemName)
              setItemName('')
              handleClose()
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Stack direction={'row'} spacing={30}>
        {/* <Modal open={searchMode} onClose={searchClose}> */}
        <Box>
          <Stack direction="row">
            <Typography variant = "h6" direction={"row"}>Search Item</Typography>
            <Stack width="100%" direction={'row'} gap={2}>
              <TextField fullWidth value={searched} onChange={(e)=> {setSearched(e.target.value)}} label={"Enter Item Name"}></TextField>
              {/* <Button variant="outlined" onClick={()=>{
                setSearch(true)
                updateInventory()
                searchClose()
              }}>
                Search
              </Button> */}
            </Stack>
          </Stack>
        </Box>
      {/* </Modal> */}
        <Button sx={{height: '50%', transform: "translate(0,30%)"}} variant="contained"
        onClick={()=>{
          handleOpen()
        }}>
          Add New Item
        </Button>
        {/* <Button variant="contained"
        onClick={()=>{
          handleClose()
          searchOpen()
        }}>
          Search Item
        </Button> */}
        
      </Stack>
      <Box border="1px solid #333">
        <Box width="800px" height="100px" bgcolor="#8031A7">
          <Typography variant="h2" color ="#333" display= "flex" alignitem="center" justifyContent={'center'}> Inventory Item</Typography>
        </Box>
      <Stack width="800px" height="450px" spacing={2} overflow="auto">
      { 
         
          inventory.map(({name,quantity})=>(
                <Box key={name} width="100%" minHeight={'150px'} display="flex" justifyContent={"space-between"} alignItems={'center'} bgcolor="#f0f0f0" padding={5}>
                    <Typography variant="h3" color="#333" textalgin="center">
                    {name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                    <Typography variant="h3" color="#333" textalgin="center">{quantity}</Typography> 
                    <Stack direction={"row"} spacing={1}>
                      <Button variant="contained" onClick={()=>{
                        updateItem(name)
                      }}>Add</Button>
                      <Button variant="contained" onClick={()=>{
                        removeItem(name)
                      }}>Remove</Button>
                    </Stack>            
                </Box>
                
              ))
          
        }
      </Stack>
    </Box>
  </Box>
  );
}
