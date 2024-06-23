import React, { useEffect, useRef, useState } from 'react';
import { AutoComplete, Breadcrumb, Button, Card, Col, Divider, Dropdown, Empty, FloatButton, Form, Input, Layout, Menu, Modal, Row, Space, Tag, Tooltip, theme } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MoreOutlined, PicCenterOutlined, PlusOutlined, PushpinOutlined, SyncOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import CustomTags from '../../components/CustomTags';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoginModal from '../Login/LoginModal';
import Cookies from 'js-cookie';



const { Header, Content, Footer } = Layout;
const items = new Array(3).fill(null).map((_, index) => ({
  key: String(index + 1),
  label: `nav ${index + 1}`,
}));
const Home = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [username, setUsername] = useState(Cookies.get('username')? Cookies.get('username') : null);
  const [modal2Open, setModal2Open] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isSideMenu, setIsSideMenu] = useState(false);
  const cardData = [
    { id:1, title: 'Card 1', content: 'Content for card 1', extra: true, tags: ['New', 'JesyFoods'] },
    { id:2, title: 'Card 2', content: 'Content for card 1', extra: true, tags: [] },
    { id:3, title: 'Card 3', content: 'Content for card 1', extra: true, tags: [] },
    { id:4, title: 'Card 4', content: 'Content for card 1', extra: true, tags: [] },
    { id:5, title: 'Card 5', content: 'Content for card 2', extra: false, tags: [] },
    { id:6, title: 'Card 6', content: 'Content for card 3', extra: false, tags: [] },
    { id:7, title: 'Card 7', content: 'Content for card 3', extra: false, tags: [] },
    { id:8, title: 'Card 8', content: 'Content for card 3', extra: false, tags: [] },
    { id:9, title: 'Card 9', content: 'Content for card 3', extra: false, tags: [] },
    { id:10, title: 'Card 10', content: 'Content forard 3', extra: false, tags: [] },
    // Add more cards as needed
  ];
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notes, setNotes] = useState(cardData);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteTags, setNoteTags] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState(null);

  const debounceTimeoutRef = useRef(null);

  const items = [
    {
      label: 'Edit',
      key: '0',
    },
    {
      label: 'Duplicate',
      key: '1',
      disabled: true
    },
    {
      type: 'divider',
    },
    {
      key: '4',
      danger: true,
      label: 'Delete',
    },
  ];


  // === fns ====
  
  const closeModal = () =>{
    setModal2Open(false)
    setNoteTitle('')
    setNoteText('')
    setCurrentNoteId(null);
    setNoteTags([])
  }

  const editNote = (id, title, content, tags) => {
    console.log("editNote===>",id, title, content);
      setCurrentNoteId(id);
      setNoteTitle(title);
      setNoteText(content);
      setNoteTags(tags)
      setModal2Open(true);
  };

  const handleNoteChange = (value) => {
      setNoteText(value);
      
      
  };

  const renderHtmlContent = (note_content) => {
    return { __html: note_content };
};

// ==== API contens ====
const syncNotesWithBackend = async (notes) => {
  try {
      const response = await fetch('https://your-backend-api/notes', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer your-auth-token',
          },
          body: JSON.stringify({ notes }),
      });
      if (response.ok) {
          console.log('Notes synced successfully!');
      } else {
          console.error('Failed to sync notes');
      }
  } catch (error) {
      console.error('Error syncing notes:', error);
  }
};


  // ======UseEffects========
  useEffect(() => {
      // Clear the existing debounce timer
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
      }

      // Set a new debounce timer
      debounceTimeoutRef.current = setTimeout(() => {
          // if (noteText.trim() !== '' || noteTitle.trim() !== '') {
          //   // const newNote = { id: notes.length + 1, title: noteTitle, content: noteText, extra: true };
          //   // setNotes([...notes, newNote]);
          //   if (currentNoteId) {
          //       setNotes(notes.map(note =>
          //           note.id === currentNoteId ? { ...note, title: noteTitle, content: noteText, tags: noteTags } : note
          //       ));
          //   } else {
          //       const newNote = { id: notes.length + 1, title: noteTitle, content: noteText, extra: true, tags: noteTags };
          //       setNotes([...notes, newNote]);
          //   }
          // }
          if (noteText.trim() !== '' || noteTitle.trim() !== '') {
            if (currentNoteId) {
                // Update the existing note and move it to the beginning of the list
                const updatedNotes = notes.map(note =>
                    note.id === currentNoteId ? { ...note, title: noteTitle, content: noteText, tags: noteTags } : note
                );
                const updatedNote = updatedNotes.find(note => note.id === currentNoteId);
                const filteredNotes = updatedNotes.filter(note => note.id !== currentNoteId);
                setNotes([updatedNote, ...filteredNotes]);
            } else {
                // Add the new note to the beginning of the list
                const newNote = { id: notes.length + 1, title: noteTitle, content: noteText, extra: true, tags: noteTags };
                setNotes([newNote, ...notes]);
            }
        }
      }, 1000); // Save the note after 1 second of inactivity
  }, [noteTitle, noteText, noteTags]);


  useEffect(() => {
      // Load notes from local storage when the component mounts
      const savedNotes = JSON.parse(localStorage.getItem('notes'));
      if (savedNotes) {
          setNotes(savedNotes);
      }
  }, []);
  useEffect(() => {
      // Save notes to local storage whenever they change
      localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
      const handleSync = async () => {
          if (isLoggedIn && navigator.onLine) {
              await syncNotesWithBackend(notes);
          }
      };
      handleSync();
      setUsername(Cookies.get('username'))
  }, [isLoggedIn, notes]);



  console.log("noteText==>",noteText);
  console.log("currentNoteId==>",currentNoteId);
  console.log("notes==>",notes);
  return (
    <Layout>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent:'space-between'
        }}
      >
        {/* <div className="demo-logo" /> */}
        {/* <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items}
          style={{
            flex: 1,
            minWidth: 0,
          }}
        /> */}
        <h2 style={{color:'#fff'}}>Flash Notes</h2>
        {username ?
        <a style={{color:'lightgray'}} >{username}</a>
        :
        <a style={{color:'lightgray'}} onClick={() => {setLoginOpen(true)}}>Login</a>
        }
      </Header>
      <Content
        id='base_content'
        style={{
          // padding: '0 98px',  
          display:'flex',
          // width:'100%'     
        }}
      >
        
          <div id='side_menu' className={isSideMenu ? 'open' : ''} >
            <h2>Side Menu</h2>
          </div>
        
        <div id='main_content' >
          <div style={{display:'flex',alignItems:'center', justifyContent:'space-between'}}>
            <Button onClick={() => {setIsSideMenu(!isSideMenu)}} type="primary" shape="circle" 
            className={`icon-animation ${isSideMenu ? 'rotate-exit' : 'rotate-enter'}`}
            icon={isSideMenu ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
             />

            <AutoComplete
              popupClassName="certain-category-search-dropdown"
              popupMatchSelectWidth={500}
              style={{
                width: '50%',
                margin:'10px'
              }}
              // options={options}
              size="large"
            >
              <Input.Search size="large" placeholder="Search here..." />
            </AutoComplete>
            <div>
              <Button type="primary" shape="circle" icon={<PicCenterOutlined />} />
              <Button style={{marginLeft:'5px'}}  shape="circle" icon={<MoreOutlined />} />
            </div>
          </div>
          <div
            style={{
              // padding: 24,
              // minHeight: 380,
              minHeight:'75vh',
              // background: colorBgContainer,
              // borderRadius: borderRadiusLG,
            }}
          >
            {/* <Divider orientation="left">sub-element align left</Divider> */}
              {true ? 
            <Row 
            gutter={{
              xs: 8,
              sm: 16,
              md: 24,
              lg: 32,
            }}>
              {notes.map((note, index) => (
                <Col className="gutter-row" span={6} xs={{span: 20,offset: 3}} sm={{span: 8,offset: 3}} md={{span: 8, offset:0}} lg={6} xl={6} key={index} >
                  <Card
                    className='card-list'
                    onClick={() => editNote(note.id, note.title, note.content, note.tags)}
                    title={note.title}
                    bordered={false}
                    // bodyStyle={{padding: "0"}}
                    styles={{ body: { padding: '0 15px', height: '110px', overflow: 'hidden', whiteSpace: 'pre-wrap' } }}
                    // extra={card.extra && <a href="#"><MoreOutlined /></a>}
                    extra={note.extra && 
                      <div className=''>
                        <span style={{marginRight:'5px', cursor:'pointer'}}>
                        <PushpinOutlined />
                        </span>
                      <Dropdown
                        menu={{
                          items,
                        }}
                      >
                        <a onClick={(e) => e.preventDefault()}>
                          <Space>
                            <MoreOutlined />
                          </Space>
                        </a>
                      </Dropdown> 
                      </div>
                    }
                  >
                    {/* {note.content} */}
                    <div style={{maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis'}} dangerouslySetInnerHTML={renderHtmlContent(note.content)} />
                    
                  </Card>
                  </Col>
                ))}
            </Row>
                :
                <Empty
                  image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  imageStyle={{
                    height: 300,
                  }}
                  description={
                    <span>
                    Empty <a href="#API">FlashNotes</a>
                    </span>
                  }
                >
                  <Button type="primary" onClick={() => setModal2Open(true)}>Create Now</Button>
                </Empty>
                }
          </div>
          <FloatButton type="primary" icon={<PlusOutlined />} onClick={() => setModal2Open(true)} />
            
        </div>
      
      </Content>
        {/* Card Modal */}
        <Modal
          title={
            <div className='btw' style={{borderBottom:'1px solid #f1f1f1'}}>
            <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Heading..." variant="borderless" maxLength={50} style={{fontWeight:'bold',fontSize:'17px'}} />
            </div>
          }
          width={'65%'}
          centered
          open={modal2Open}
          onOk={() => setModal2Open(false)}
          onCancel={closeModal}
          footer={
            <div style={{display:'flex', justifyContent:'space-between', width:'100%',textAlign:'center',alignItems:'center',borderTop:'1px solid #f1f1f1',paddingTop:'5px'}}>
              {/* <Input style={{color:'gray'}} placeholder="Add tags" variant="borderless" /> */}
              <CustomTags noteTags={noteTags} setNoteTags={setNoteTags} />
              <Tooltip placement="top" title="Click to sign in to your account and sync!" >
              <Tag color="warning" icon={<ExclamationCircleOutlined />}><span style={{cursor:'pointer'}} onClick={()=>{alert("Please sign in to your account")}} >Not synced</span></Tag>
              </Tooltip>
              {/* <Tag icon={<CheckCircleOutlined />} color="success">Synced</Tag> */}
              {/* <Tag icon={<SyncOutlined spin />} color="processing">Saving...</Tag> */}
            </div>
          }
        >
          {/* <TextArea rows={10} placeholder='Type notes here' variant="borderless" /> */}
          <ReactQuill
            value={noteText}
            theme="snow"
            onChange={handleNoteChange}
            // onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type notes here"
            modules={{
              toolbar: [
                [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                [{size: []}],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, 
                {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'video'],
                ['clean']                                        
              ],
            }}
            formats={[
              'header', 'font', 'size',
              'bold', 'italic', 'underline', 'strike', 'blockquote',
              'list', 'bullet', 'indent',
              'link',  'video'
            ]}
            style={{minHeight:'250px'}}
          />
        </Modal>
      
        {/* Login Modal */}
        {/* <Modal
          title="Vertically centered modal dialog"
          centered
          open={loginOpen}
          onOk={() => setLoginOpen(false)}
          onCancel={() => setLoginOpen(false)}
        >
          <p>some contents...</p>
          <p>some contents...</p>
          <p>some contents...</p>
        </Modal> */}

        <LoginModal 
          loginOpen={loginOpen}
          setLoginOpen={setLoginOpen}
          setIsLoggedIn={setIsLoggedIn}
        />



      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        NFOUR FlashNotes ©{new Date().getFullYear()} Created by NFOUR Group
      </Footer>
    </Layout>
  );
};
export default Home;