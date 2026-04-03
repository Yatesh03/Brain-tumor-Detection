import React from 'react'
import styled from 'styled-components';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Container = styled.div`
    max-width: 100%;
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    align-items: center;
    border: 2px dashed ${({ theme }) => theme.soft + "55"};
    border-radius: 14px;
    color: ${({ theme }) => theme.soft};
    background: #ffffff08;
    padding: 22px;
`;

const Typo = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
`;

const TextBtn = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.primary};
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
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
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <div style={{ color: "#a8b0c2" }}>or</div>
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