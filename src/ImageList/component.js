import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, Row, Col } from 'antd';
import { Layout } from 'antd';
import Resizer from "react-image-file-resizer";
import { ImageList } from '@mui/material';
import { ImageListItem } from '@mui/material';
import resizebase64 from 'resize-base64';
import axios from 'axios';

const TRANSFORMATIONS = {
    GRADIENT: 'GRADIENT',
    HIST_NORMALIZE: 'HIST_NORMALIZE',
    BLUR: 'BLUR',
    SHARPEN: 'SHARPEN',
    NEGATIVE: 'NEGATIVE',
}

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => { reject(error) };
    });

const resizeFile = (file) =>
    new Promise((resolve) => {
        Resizer.imageFileResizer(
            file,
            250,
            250,
            "JPEG",
            100,
            0,
            (uri) => {
                resolve(uri);
            },
            "base64"
        );
    });

const ImageListComponent = () => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState();
    const [imageList, setImageList] = useState([]);
    const [imageToUpload, setImageToUpload] = useState();
    const [transformations, setTransformations] = useState([]);
    useEffect(() => {
        const f = () => {
            axios.get('http://localhost:8000/api/transformation/final/').then(response => {
                setImageList([...response.data.results]);
            });
            
        }
        f();
    }, [imageToUpload])

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{
                marginTop: 8,
            }}
            >
                Upload
            </div>
        </div>
    );

    const previewModal = (
        <Modal
            title='Edit'
            visible={editModalVisible}
            onOk={async () => {
                setPreviewImage();
                setEditModalVisible(false);
                const response = await axios.post('http://localhost:8000/api/transformation/final/', { img: imageToUpload, transformations });
                setImageList([...imageList, response.data]);
                setTransformations([])
                setImageToUpload();
            }}
            onCancel={() => {
                setPreviewImage();
                setImageToUpload();
                setEditModalVisible(false);
                setTransformations([]);
            }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <div>
                    <img alt='preview-image' src={previewImage} style={{
                        filter: 'grayscale(1)',
                    }}></img>
                </div>
                <div style={{
                    width: '100%',
                }}>
                    <div style={{ textAlign: 'center' }}>Tools</div>
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <button style={{ width: '50%', margin: 10 }} onClick={async () => {
                            setTransformations([...transformations, TRANSFORMATIONS.GRADIENT])
                            const response = await axios.post('http://localhost:8000/api/test/transformation/', { img: previewImage, transformations });
                            setPreviewImage(response.data['img']);
                        }} >Gradient</button>
                        <button style={{ width: '50%', margin: 10  }} onClick={async () => {
                            setTransformations([...transformations, TRANSFORMATIONS.SHARPEN])
                            const response = await axios.post('http://localhost:8000/api/test/transformation/', { img: previewImage, transformations });
                            setPreviewImage(response.data['img']);
                        }} >Sharpen</button>
                        <button style={{ width: '50%', margin: 10 }} onClick={async () => {
                            setTransformations([...transformations, TRANSFORMATIONS.BLUR])
                            const response = await axios.post('http://localhost:8000/api/test/transformation/', { img: previewImage, transformations });
                            setPreviewImage(response.data['img']);
                        }} >Blur</button>
                        <button style={{ width: '50%', margin: 10  }} onClick={async () => {
                            setTransformations([...transformations, TRANSFORMATIONS.HIST_NORMALIZE])
                            const response = await axios.post('http://localhost:8000/api/test/transformation/', { img: previewImage, transformations });
                            setPreviewImage(response.data['img']);
                        }} >Normalize</button>
                        <button style={{ width: '50%', margin: 10  }} onClick={async () => {
                            setTransformations([...transformations, TRANSFORMATIONS.NEGATIVE])
                            const response = await axios.post('http://localhost:8000/api/test/transformation/', { img: previewImage, transformations });
                            setPreviewImage(response.data['img']);
                        }} >Negative</button>
                    </div>
                </div>
            </div>
        </Modal>
    );

    const handleUploadClick = async (file, fileList) => {
        setEditModalVisible(true);
        const resized = await resizeFile(file)
        setPreviewImage(resized);
        const img = await getBase64(file);
        setImageToUpload(img);
    }

    const handleImageClick = async (e) => {
        setEditModalVisible(true);
        const resized = resizebase64(e.target.src, 150, 150);
        setPreviewImage(resized);
    };

    return (
        <>
            <Layout>
                <Layout.Sider style={{
                    backgroundColor: 'white',
                    height: '100%',
                }}>
                    <Upload
                        beforeUpload={handleUploadClick}
                        customRequest={() => { }}
                        previewFile={() => { }}
                        showUploadList={false}
                    >
                        {uploadButton}
                    </Upload>
                    {previewModal}
                </Layout.Sider>
                <Layout.Content style={{ backgroundColor: 'white', width: '100%', height: '100%' }}>
                    <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
                        {
                            imageList.map(image => (
                                <ImageListItem key={Math.random().toString()}>
                                    <a href={image.url}><img src={image.url} style={{
                                        width: 164,
                                        height: 164,
                                        filter: 'grayscale(1)',
                                    }}></img></a>
                                </ImageListItem>
                            ))
                        }
                    </ImageList>
                </Layout.Content>
            </Layout>
        </>
    );
};

export default ImageListComponent;