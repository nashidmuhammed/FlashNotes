import React, { useEffect, useRef, useState } from 'react';
import { AutoComplete, Breadcrumb, Button, Card, Col, Divider, Dropdown, Empty, FloatButton, Form, Input, Layout, Menu, Modal, Row, Skeleton, Space, Tag, Tooltip, message, theme } from 'antd';
import { CheckCircleOutlined, DownOutlined, ExclamationCircleFilled, ExclamationCircleOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MoreOutlined, PicCenterOutlined, PlusOutlined, PushpinOutlined, SyncOutlined, ThunderboltOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import CustomTags from '../../components/CustomTags';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoginModal from '../Login/LoginModal';
import Cookies from 'js-cookie';
import { FlashBaseUrl } from '../../utils/GlobalVariable';
import axios from 'axios';
const { Search } = Input;

const { confirm } = Modal;

const { Header, Content, Footer } = Layout;
const primaryColor = '#051622'
const secondaryColor = '#1BA098'
const textColor = '#DEB992'
const items = new Array(3).fill(null).map((_, index) => ({
  key: String(index + 1),
  label: `nav ${index + 1}`,
}));
const Home = () => {
  const accessToken = Cookies.get('access');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [username, setUsername] = useState(Cookies.get('username')? Cookies.get('username') : null);
  const [searchKey, setSearchKey] = useState("");
  const [noteModal, setNoteModal] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isSideMenu, setIsSideMenu] = useState(false);
  const [isDropDown, setIsDropDown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isMore, setIsMore] = useState(false);
  const [isSync, setIsSync] = useState(false);
  const cardData = [
    { 
      id:1,
      uid:null,
      updated:false,
      title: 'Card 1', 
      content: 'Content for card 1', 
      extra: true, 
      tags: ['New', 'JesyFoods'] 
    },
    { 
      id:2, 
      title: 'Card 2', 
      content: 'Content for card 1', 
      extra: false, 
      tags: [] 
    },
    // Add more cards as needed
  ];
  // const [isLoggedIn, setIsLoggedIn] = useState(Cookies.get('access') ? true : false);
  const [notes, setNotes] = useState(null);
  const [tags, setTags] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteTags, setNoteTags] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    console.log('You are interested in: ', nextSelectedTags);
    setSelectedTags(nextSelectedTags);
  };

  const debounceTimeoutRef = useRef(null);

  const handleDropdownVisibleChange = (noteId, visible) => {
    console.log("VISIBILITY=====>",visible);
    setIsDropDown(visible)
  };

  const handleLogout = () => {
    // Clear user data from local storage
    setIsLoading(true)
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "use_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUsername(null)
    setNotes(null)
    setIsLoading(false)
    setIsMore(false)
    message.success('Logout successfully')
  }

  const onSearch = (search) => {
    console.log("search===>",search);
    setIsLoading(true)
    setSearchKey(search)
    fetchData()
  }
  const onLoadMore = () =>{
    setIsLoadMore(true)
    setPage(page+1)
    console.log("====LoadMore===",page);
  }
  const handleDelete = (note) => {
    closeModal()
    console.log("note___---id===>",note);
    
    confirm({
      title: 'Are you sure delete this note?',
      icon: <ExclamationCircleFilled />,
      content: 'Deleted notes can recover within 30 days from trash',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteNoteApi(note)
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const items = [
    {
      label: <a href="#">Account</a>,
      key: '0',
      disabled: true
    },
    {
      type: 'divider',
    },
    {
      label: <a style={{color:"red"}} onClick={handleLogout} >Logout</a>,
      key: '3'
    },
  ];
  const menuProps = (note) => ({
    items: [
      {
        label: 'Edit',
        key: 'edit',
      },
      {
        label: 'Duplicate',
        key: 'duplicate',
        disabled: true
      },
      {
        key: note, 
        label: 'Delete',
        danger: true,
        onClick: () => handleDelete(note), 
      },
    ],
  });



  // === fns ====
  
  const newNote = () =>{
    setNoteModal(true)
    setNoteTitle('')
    setNoteText('')
    setCurrentNoteId(null);
    setNoteTags([])
  }

  const closeModal = () =>{
    setNoteModal(false)
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
      setNoteModal(true);
  };

  const handleNoteChange = (value) => {
      setNoteText(value);   
  };

  const renderHtmlContent = (note_content) => {
    return { __html: note_content };
};

// ==== API contens ====
const fetchData = async () => {
  console.log("Called fetch");
  setIsLoading(true)
  try {
    const response = await axios.get(
      `${FlashBaseUrl}/v1/notes/note/?q=${searchKey}&tags=${selectedTags}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.data.status_code === 1000){
      const savedNotes = JSON.parse(localStorage.getItem('notes'));
      console.log("savedNotes===>",savedNotes);
      if (savedNotes){
        const filteredNotes = savedNotes.filter((note) => !note.updated);
        console.log("filteredNotes===>",filteredNotes);
        setNotes([...filteredNotes, response.data.data]);
      }
      setNotes(response.data.data);
      setIsMore(response.data.is_more); 
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle errors appropriately, e.g., display error messages to the user
    return null; // Or return a default value
  }
  setIsLoading(false)
};
const fetchTags = async () => {
  console.log("Called fetch");
  try {
    const response2 = await axios.get(
      `${FlashBaseUrl}/v1/tags/tag/?`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response2.data.status_code === 1000){
      setTags(response2.data.data)
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null; 
  }
};



const syncNotesWithBackend = async (notes) => {
  console.log("note-filteredNotes--call api==>",notes);
  try {
      const response = await fetch(FlashBaseUrl+'/v1/notes/note/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ notes }),
      });
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status_code === 1000){
          console.log('Notes synced successfully!');
          const uidList = responseData.uidList
          const newList = responseData.newList
          setNotes(prevNotes =>
            prevNotes.map(note => {
                // Find the new ID for the note
                const mapping = newList.find(map => map.id === note.id);
                const newId = mapping ? mapping.uid : note.id;
                
                // Check if the UID is in the uidList
                const updated = uidList.includes(note.uid);

                // Return the updated note
                return { ...note, id: newId, updated:true };
            })
          );
          setIsSync(false)
          // setNotes(prevNotes =>
          //   prevNotes.map(note =>
          //       uidList.includes(note.id)
          //           ? { ...note, updated: true }
          //           : note
          //   )
          // );
        }
      } else {
          console.error('Failed to sync notes');
      }
  } catch (error) {
      console.error('Error syncing notes:', error);
  }
};


const deleteNoteApi = async (noteId) => {
  try {
    const response = await fetch(`${FlashBaseUrl}/v1/notes/note/?id=${noteId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const responseData = await response.json();
    if (responseData.status_code === 1000) {
      console.log('Note deleted successfully');
      message.success(responseData.message)
      setNotes((prevNotes) => prevNotes.filter(note => note.id !== noteId));
    } else {
      message.warning(responseData.message)
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

  // ======UseEffects========
  useEffect(() => {
    const fetchNotes = async () => {
      const response = await axios.get(
      `${FlashBaseUrl}/v1/notes/note/?q=${searchKey}&tags=${selectedTags}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
      setNotes(prevNotes => [...prevNotes, ...response.data.data]); // Append new data
      setIsMore(response.data.is_more); 
      setIsLoadMore(false)
    };
    if(page > 1){
      fetchNotes();
    }
  }, [page]);

  useEffect(() => {
      // Clear the existing debounce timer
      setIsSync(true)
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
      }

      // Set a new debounce timer
      debounceTimeoutRef.current = setTimeout(() => {         
          if (noteText.trim() !== '' || noteTitle.trim() !== '') {
            if (currentNoteId) {
                // Update the existing note and move it to the beginning of the list
                const updatedNotes = notes.map(note =>
                    note.id === currentNoteId ? { ...note, updated:false, title: noteTitle, content: noteText, tags: noteTags } : note
                );
                const updatedNote = updatedNotes.find(note => note.id === currentNoteId);
                const filteredNotes = updatedNotes.filter(note => note.id !== currentNoteId);
                setNotes([updatedNote, ...filteredNotes]);
            } else {
                // Add the new note to the beginning of the list
                let notes_id = notes ? (notes.length + 1) : 1
                setCurrentNoteId(notes_id);
                const newNote = { 
                  id: notes_id, 
                  uid:null,
                  updated:false,
                  title: noteTitle, 
                  content: noteText, 
                  extra: true, 
                  tags: noteTags
                 };
                 console.log("new__note==>",newNote);
                 if (notes){
                   setNotes([newNote, ...notes]);
                  }else{
                    setNotes([newNote]);
                  }
            }
        }
      }, 1000); // Save the note after 1 second of inactivity
  }, [noteTitle, noteText, noteTags]);

  useEffect(() => {
    if (username){

      fetchData()
    }else{
      setIsLoading(false)
    }
  },[searchKey,selectedTags, username])

  useEffect(() => {
      if (username){
        fetchData();
        fetchTags();
      }else{
        const savedNotes = JSON.parse(localStorage.getItem('notes'));
        if (savedNotes) {
            setNotes(savedNotes);
        }
      }
  }, []);

  useEffect(() => {
      // Save notes to local storage whenever they change
      localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    console.log("=======Called usefect======");
    if (notes){
      const handleSync = async () => {
          if (accessToken && navigator.onLine && notes.filter((note) => !note.updated)) {
            const filteredNotes = notes.filter((note) => !note.updated);  
            if (filteredNotes?.length > 0){
              const curr = filteredNotes.some((item) => item.id === currentNoteId)
              console.log("curr==>",curr);
              setIsSync(curr)
              await syncNotesWithBackend(filteredNotes);
            }
          }
      };
      handleSync();
      setUsername(Cookies.get('username'))
    }
  }, [accessToken, notes, username]);

  useEffect(() => {
    if(currentNoteId){const currentNote = notes.filter(item => item.id === currentNoteId);
    console.log("currentNote====>",currentNote);
    if(currentNote){

      console.log("is_update====>",currentNote[0].updated);
      if(currentNote[0].updated){
        setIsSync(false)
      }
    }}
  },[currentNoteId])


  console.log("###noteText==>",noteText);
  console.log("###currentNoteId==>",currentNoteId);
  console.log("###noteTitle==>",noteTitle);
  console.log("###notes==>",notes);
  console.log("###tags==>",tags);
  return (
    <Layout style={{backgroundColor: secondaryColor}}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent:'space-between',
          background: primaryColor
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
        <h2 style={{color:textColor}}><ThunderboltOutlined /> Flash Notes</h2>
        {username ?
        <>
        <Dropdown
            menu={{
              items,
            }}
            trigger={['click']}
          >
            {/* <a onClick={(e) => e.preventDefault()}>
              <Space>
                Click me
                <DownOutlined />
              </Space>
            </a> */}
            <a onClick={(e) => e.preventDefault()} style={{color:textColor}} ><UserOutlined /> {username} <DownOutlined /></a>
          </Dropdown>
        </>
        :
        <a style={{color:textColor}} onClick={() => {setLoginOpen(true)}}>Login <UserAddOutlined /></a>
        }
      </Header>

      {isLoading ?      
      <>
      <Row
      style={{margin:'10px'}}
        gutter={{
          xs: 8,
          sm: 16,
          md: 24,
          lg: 32,
        }}
      >
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
      </Row>
      <Row
      style={{margin:'10px'}}
        gutter={{
          xs: 8,
          sm: 16,
          md: 24,
          lg: 32,
        }}
      >
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
      </Row>
      <Row
      style={{margin:'10px'}}
        gutter={{
          xs: 8,
          sm: 16,
          md: 24,
          lg: 32,
        }}
      >
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div ><Skeleton active /></div>
        </Col>
      </Row>
      </>
      :
      <Content
        id='base_content'
        style={{
          // padding: '0 98px',  
          display:'flex',
          background:secondaryColor
          // width:'100%'     
        }}
      >
        
          <div id='side_menu' className={isSideMenu ? 'open' : ''} >
            <h2>Tags</h2>
            <p><Tag style={{cursor:'pointer', fontSize:'13px'}} onClick={() => {setSelectedTags([])}}>Clear All</Tag></p>
            {tags?.length > 0 && tags.map((tag) => (
              // <p><Tag style={{cursor:'pointer', fontSize:'15px'}} >{tag.name}</Tag></p>
              <p><Tag.CheckableTag
                key={tag}
                style={{fontSize:'15px', color: primaryColor}}
                checked={selectedTags.includes(tag.id)}
                onChange={(checked) => handleChange(tag.id, checked)}
              >
                {tag.name}
              </Tag.CheckableTag>
              </p>
            ))}
          </div>
        
        <div id='main_content' >
          <div style={{display:'flex',alignItems:'center', justifyContent:'space-between'}}>
            <Button onClick={() => {setIsSideMenu(!isSideMenu)}} type="primary" shape="circle" 
            className={`icon-animation ${isSideMenu ? 'rotate-exit' : 'rotate-enter'}`}
            icon={isSideMenu ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
             />

            {/* <AutoComplete
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
            </AutoComplete> */}
            <Search
              placeholder="Search here"
              onSearch={(onSearch)}
              size="large"
              allowClear
              style={{
                width: '50%',
                margin:'10px'
              }}
              className='primary-search'
            />
            <div>
              <Button className='btn-primary' type="primary" shape="circle" icon={<PicCenterOutlined />} />
              <Button className='btn-primary' style={{marginLeft:'5px'}}  shape="circle" icon={<MoreOutlined />} />
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
            {notes?.length > 0 ? 
            <>
              <Row 
              gutter={{
                xs: 8,
                sm: 16,
                md: 24,
                lg: 32,
              }}>
                {notes?.map((note, index) => (
                  <Col className="gutter-row" span={6} xs={{span: 20,offset: 3}} sm={{span: 8,offset: 3}} md={{span: 8, offset:0}} lg={6} xl={6} key={index} >
                    <Card
                      className='card-list'
                      onClick={() => !isDropDown && editNote(note.id, note.title, note.content, note.tags)}
                      title={note.title}
                      bordered={false}
                      // bodyStyle={{padding: "0"}}
                      styles={{ body: { padding: '0 15px', height: '110px', overflow: 'hidden', whiteSpace: 'pre-wrap' } }}
                      // extra={card.extra && <a href="#"><MoreOutlined /></a>}
                      // extra={true && 
                      //   <div className=''>
                      //     <span style={{marginRight:'5px', cursor:'pointer'}}>
                      //     <PushpinOutlined />
                      //     </span>
                      //   <Dropdown
                      //     menu={menuProps}
                      //   >
                      //     <a onClick={(e) => e.preventDefault()}>
                      //       <Space>
                      //         <MoreOutlined />
                      //       </Space>
                      //     </a>
                      //   </Dropdown> 
                      //   </div>
                      // }
                      extra={<Dropdown
                            menu={menuProps(note.id)}
                            onOpenChange={(visible) => handleDropdownVisibleChange(note.id, visible)}
                          >
                            <a onClick={(e) => e.preventDefault()}>
                              <Space>
                                <MoreOutlined />
                              </Space>
                            </a>
                          </Dropdown> }
                    >
                      {/* {note.content} */}
                      <div style={{maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis'}} dangerouslySetInnerHTML={renderHtmlContent(note.content)} />
                      
                    </Card>
                    </Col>
                  ))}
                  {isLoadMore &&
              <>
              {/* <Row
              style={{margin:'10px'}}
                gutter={{
                  xs: 8,
                  sm: 16,
                  md: 24,
                  lg: 32,
                }}
              > */}
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
              {/* </Row>
              <Row
              style={{margin:'10px'}}
                gutter={{
                  xs: 8,
                  sm: 16,
                  md: 24,
                  lg: 32,
                }}
              > */}
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
              {/* </Row>
              <Row
              style={{margin:'10px'}}
                gutter={{
                  xs: 8,
                  sm: 16,
                  md: 24,
                  lg: 32,
                }}
              > */}
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div ><Skeleton active /></div>
                </Col>
              {/* </Row> */}
              </>
              }
              </Row>
              
            </>
            :
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                imageStyle={{
                  height: 300,
                }}
                description={
                  <span style={{color: primaryColor}}>
                  Empty  FlashNotes
                  </span>
                }
              >
                <Button className='btn-primary' type="primary" onClick={newNote}>Create Now</Button>
              </Empty>
            }
            {!isLoadMore &&
            <div
              style={{
                textAlign: 'center',
                marginTop: 12,
                height: 32,
                lineHeight: '32px',
                display: isMore ? 'block' : 'none'
              }}
            >
              <Button className='btn-primary' onClick={onLoadMore}>loading more</Button>
            </div>
          }
          </div>
          <FloatButton className='float-btn' type="primary" icon={<PlusOutlined />} onClick={newNote} />
            
        </div>
      
      </Content>
      }
        {/* Card Modal */}
        <Modal
          title={
            <div className='btw' 
            // style={{borderBottom:'1px solid #f1f1f1'}}
            >
            <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Heading..." variant="borderless" maxLength={50} style={{fontWeight:'bold',fontSize:'17px'}} />
            </div>
          }
          width={'65%'}
          centered
          open={noteModal}
          onOk={() => setNoteModal(false)}
          onCancel={closeModal}
          footer={
            <div style={{display:'flex', justifyContent:'space-between', width:'100%',textAlign:'center',alignItems:'center',borderTop:'1px solid #f1f1f1',paddingTop:'5px'}}>
              {/* <Input style={{color:'gray'}} placeholder="Add tags" variant="borderless" /> */}
              <CustomTags noteTags={noteTags} setNoteTags={setNoteTags} />
              {username?
              (isSync?
              <Tag icon={<SyncOutlined spin />} color="processing">Saving...</Tag>
              :
              <Tag icon={<CheckCircleOutlined />} color="success">Synced</Tag>
              ):
              <Tooltip placement="top" title="Click to sign in to your account and sync!" >
              <Tag color="warning" icon={<ExclamationCircleOutlined />}><span style={{cursor:'pointer'}} onClick={()=>{alert("Please sign in to your account")}} >Not synced</span></Tag>
              </Tooltip>
              }
              {/* <Tag icon={<CheckCircleOutlined />} color="success">Synced</Tag> */}
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

        <LoginModal 
          loginOpen={loginOpen}
          setLoginOpen={setLoginOpen}
          setUsername={setUsername}
        />



      <Footer
        style={{
          textAlign: 'center',
          color: primaryColor,
          backgroundColor: secondaryColor,
          display: isLoading ? 'none': 'block',
        }}
      >
        NFOUR FlashNotes ©{new Date().getFullYear()} Created by NFOUR Group
      </Footer>
    </Layout>
  );
};
export default Home;