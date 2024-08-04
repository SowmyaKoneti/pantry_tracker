'use client'
import Image from "next/image";
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper } from '@mui/material'
import { collection, getDocs, query, setDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';


export default function Home() {
  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemCount, setItemCount] = useState(1)
  const [itemExpiry, setItemExpiry] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [updatedItemName, setUpdatedItemName] = useState('');
  const [updatedCount, setUpdatedCount] = useState(1);
  const [updatedExpiryDate, setUpdatedExpiryDate] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // updating Pantry
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry_things'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setPantry(pantryList)
    console.log(pantryList)
  }

  // removing item
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry_things'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count, expiryDate } = docSnap.data(); // Get the expiry date along with count
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1, expiryDate }, { merge: true }); // Keep expiry date
      }
    }
    await updatePantry(); // Refresh pantry list
  };

  //additem

  const addItem = async (itemName, expiryDate) => {
    try {
      const docRef = doc(collection(firestore, 'pantry_things'), itemName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { count } = docSnap.data();
        await setDoc(docRef, {
          count: count + 1,
          expiryDate: expiryDate
        }, { merge: true });

        // Manually trigger updatePantry to refresh state
        await updatePantry();
      } else {
        await setDoc(docRef, { count: 1, expiryDate });
        await updatePantry();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };



  //updating item
  const handleUpdateItem = async () => {
    if (!editingItem || !updatedItemName) return;

    const docRef = doc(firestore, 'pantry_things', editingItem);

    await setDoc(docRef, {
      name: updatedItemName,
      count: Number(updatedCount), // Ensure count is a number
      expiryDate: updatedExpiryDate,
    }, { merge: true });

    setOpenEditDialog(false);
    setEditingItem(null);
    setUpdatedItemName('');
    setUpdatedCount(1);
    setUpdatedExpiryDate('');
    await updatePantry(); // Refresh the pantry list
  };



  //calculating days remaining
  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null; // Return null if expiryDate is not provided

    const today = new Date();
    const expiry = new Date(expiryDate);

    if (isNaN(expiry.getTime())) {
      console.error('Invalid expiry date:', expiryDate);
      return null; // Return null if the date is invalid
    }
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const timeDiff = expiry - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysRemaining >= 0 ? daysRemaining : 0;
  };

  //filtering items
  const filteredPantry = pantry.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    updatePantry()
  }, [])

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false)
    setItemName('')
    setItemCount(1)
  }
  const handleAddItem = () => {
    if (itemName && itemExpiry) {
      addItem(itemName, itemExpiry);
      setItemName(''); // Reset the item name input
      setItemExpiry(''); // Reset the expiry date input
      handleClose();
    } else {
      console.error('Item name or expiry date is missing');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 4 }}>
        <Typography variant="h2" gutterBottom>Pantry Tracker</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
        <TextField
          placeholder="Search Items"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: 900,
            padding: 1,
            borderRadius: '4px 0 0 4px',
            backgroundColor: 'white',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: '#000',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#000',
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: '0 4px 4px 0',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  height: '100%',
                }}
              >
                Search
              </Button>
            ),
          }}
        />
      </Box>


      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Count"
            type="number"
            fullWidth
            value={itemCount}
            onChange={(e) => setItemCount(Number(e.target.value))} // Convert to number
            sx={{ marginBottom: 2 }}
          />

          <TextField
            label="Expiry Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={itemExpiry}
            onChange={(e) => setItemExpiry(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddItem} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            fullWidth
            value={updatedItemName}
            onChange={(e) => setUpdatedItemName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Count"
            type="number"
            fullWidth
            value={updatedCount}
            onChange={(e) => setUpdatedCount(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Expiry Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={updatedExpiryDate}
            onChange={(e) => setUpdatedExpiryDate(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateItem} color="primary">Update</Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
        <Paper elevation={2} sx={{ padding: 2, marginBottom: 2, width: 1300, backgroundColor: '#87b983' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: 2 }}>
            <Typography variant="h5">Item Name</Typography>
            <Typography variant="h5">Days Remaining</Typography>
            <Typography variant="h5">Count</Typography>
            <Typography variant="h5">Actions</Typography>
          </Box>

          {filteredPantry.map((item) => {
            const daysRemaining = calculateDaysRemaining(item.expiryDate);

            let buttonColor;
            let buttonText;
            if (daysRemaining > 7) {
              buttonColor = 'success';
              buttonText = `${daysRemaining} days remaining`;
            } else if (daysRemaining <= 2) {
              buttonColor = 'error';
              buttonText = daysRemaining === 0 ? 'Tomorrow' : `${daysRemaining} days remaining`;
            } else {
              buttonColor = 'warning';
              buttonText = `${daysRemaining} days remaining`;
            }

            return (
              <Paper key={item.name} elevation={1} sx={{ padding: 2, marginBottom: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5">{item.name}</Typography>
                  <Button variant="contained" color={buttonColor} sx={{ padding: '8px 16px', minWidth: '120px' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {buttonText}
                    </Typography>
                  </Button>
                  <Typography variant="body1">{item.count}</Typography>
                  <Box>
                    <IconButton onClick={() => addItem(item.name, item.expiryDate)} color="primary">
                      <AddIcon />
                    </IconButton>
                    <IconButton onClick={() => removeItem(item.name)} color="secondary">
                      <RemoveIcon />
                    </IconButton>
                    <IconButton onClick={() => {
                      setEditingItem(item.name);
                      setUpdatedItemName(item.name);
                      setUpdatedCount(item.count);
                      setUpdatedExpiryDate(item.expiryDate);
                      setOpenEditDialog(true);
                    }} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Paper>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          sx={{
            padding: '12px 24px', // Increase padding for a larger button
            fontSize: '16px',     // Increase font size
            minWidth: '150px',    // Set a minimum width
          }}
        >
          Add Item
        </Button>
      </Box>

    </Box>
  )
}
