import React from 'react'
import styled from 'styled-components';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Container = styled.div`
    max-width: 100%;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    align-items: center;
    border: 2px dashed  ${({ theme }) => theme.soft+ '70'}};
    border-radius: 12px;
    color: ${({ theme }) => theme.soft};
    padding: 20px;
`;

const Typo = styled.div`
    font-size: 18px;
    font-weight: 600;
`;

const TextBtn = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.primary};
    cursor: pointer;
`;

const HiddenInput = styled.input`
    display: none;
`;


const ImageUpload = ({ setImages }) => {

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files || []);
        const mappedFiles = await Promise.all(
            files.map((file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        file_name: file.name,
                        base64_file: reader.result,
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }))
        );
        setImages(mappedFiles);
    };

    return (
        <Container>

            <CloudUploadIcon sx={{ fontSize: "100px" }} />
            <Typo>Drag & Drop Image(s) here</Typo>
            <div style={{display: "flex", gap: '6px'}}>
                <Typo>or</Typo>
                <label htmlFor="image-upload-input">
                    <TextBtn as="span">Browse Image</TextBtn>
                </label>
                <HiddenInput
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                />
            </div>
        </Container>
    )
}

export default ImageUpload