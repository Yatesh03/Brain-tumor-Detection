import React from 'react'
import styled from 'styled-components';

const Container = styled.div`
    display:flex;
    flex-direction: column;
    justify-content:center;
    align-items: center;
    border: 1px solid ${({ theme }) => theme.soft + "44"};
    border-radius: 12px;
    color: ${({ theme }) => theme.soft};
    padding: 6px;
    background: #ffffff06;
`;

const Image = styled.img`
    width: 100%;
    max-width: 140px;
    height: 100px;
    object-fit: cover;
    border-radius: 10px;
`;

const ImageText = styled.div`
    text-align: center;
    padding: 6px 4px 2px 4px;
    font-weight: 500;
    color: ${({ theme }) => theme.textSoft};
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 130px;
`;

const ImagesCard = ({ image }) => {
    return (
        <Container>
            <Image src={image.base64_file} alt={image.file_name} />
            <ImageText>{image.file_name}</ImageText>
        </Container>
    )
}

export default ImagesCard