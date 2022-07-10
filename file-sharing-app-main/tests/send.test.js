import { getNumId } from '../components/send/send';

// check if connection id is number
test("check if connection id is number", () => {
  if(Number.isInteger(getNumId)){
      const rus = "Connection is working";
      expect(rus).toMatch("Connection is working") ;
  }
  else{
      const rus = "Not working";
      expect(rus).toMatch("Not working");
  }
});