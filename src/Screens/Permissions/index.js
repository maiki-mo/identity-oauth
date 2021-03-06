import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  CustomButton,
  Banner,
  Header,
  LineItem,
  Policy,
} from '../../Components';
import { Sizes, Colors, Data } from '../../Constants';
import identityService from '../../Services/identity';
import logo from '../../assets/images/old-rocket.png';

const { auth: { getPermissions, grantAuths } } = identityService;
const { DESKTOP, MOBILE } = Sizes;
const { bgBlack, bodyBlack } = Colors;

const Image = styled.img`
  margin: 0 auto;
  margin-top: 50px;
  height: 110px;
  width: 380px;
  border-radius: 8px;

  @media ${MOBILE} {
    height: 30vmin;
  }
`

const BodyDiv = styled.div`
  display: inline-block;
  height: 40vh;
  background-color: white;
  padding: 0px 20px;
  overflow-y: scroll;

  @media ${MOBILE} {
    flex: 1;
  }
`

const FooterDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  padding: 0px 20px;
  background-color: white;
`

const Body = styled.div`
  background-color: white;

  @media ${DESKTOP} {
    display: flex;
    min-height: 100vh;
    justify-content: center;
    align-items: center;
  }

  @media ${MOBILE} {
    height: 100vh;
  }
`

const Container = styled.div`
  @media ${DESKTOP} {
    text-align: center;
    width: 500px;
    overflow: hidden;
    box-shadow: 2px 2px 6px black;
  }

  @media ${MOBILE} {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`

class Permissions extends Component {
  state = { permissions: [] }

  async componentDidMount() {
    try {
      const response = await getPermissions();
      if (response.status === 200) {
        const { data: { permissions } } = response;
        this.setState({ permissions });
      }
      else console.warn('something went wrong');
    }
    catch (e) {
      console.warn(e);
    }
  }

  nextPath = (url, params) => {
    const { history } = this.props;
    history.push(url, params);
  }

  list = () => this.state.permissions.map(
    ({ consumer, scope, read, write }) => (
      <LineItem
        key={`${scope.id}${consumer.id}`}
        request={
          `${scope.name} -   
          ${read.required ? 'Read access' : ''}
          ${read.required && write.required ? ' & ' : ''}
          ${write.required ? 'Write access' : ''}`
        }
        response={
          `${scope.description}`
        }
      />
    )
  )

  submit = async () => {
    const {
      toggleLoader,
      history: {
        location: {
          state: {
            identityId,
          },
        },
      },
    } = this.props;
    const { permissions } = this.state;

    try {
      toggleLoader(true);
      const response = await grantAuths(
        identityId,
        permissions.map(({ scope }) => {
          return {
            scope: scope.name,
            read: true,
            write: true,
            share: true
          };
        })
      );
  
      if (response.status === 201) this.nextPath("/auth/complete", response.data);
      else console.warn('something went wrong');
      toggleLoader(false);
    }
    catch (e) {
      toggleLoader(false);
      console.warn(e);
    }
  }

  render () {
    return (
      <Body>
      <Container>

        {/* <Header merchant="NCR IDENTITY" /> */}
        <Image src={logo} alt="AVATAR" />

        <BodyDiv>
          <Banner merchant="NCR IDENTITY" />
          {this.list()}
        </BodyDiv>

        <Policy />

        <FooterDiv>
          <CustomButton text="CANCEL" onClick={() => this.nextPath('/auth/complete', {})} />
          <CustomButton primary text="AUTHORIZE" onClick={this.submit} />
        </FooterDiv>

      </Container>
    </Body>
    );
  }
};

Permissions.defaultProps = {
  permissions: Data.data,
}

Permissions.propTypes = {
  permissions: PropTypes.arrayOf(
    PropTypes.shape({}),
  ),
}

export default withRouter(Permissions);
